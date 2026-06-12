import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import { useInsuranceStore } from '@/store'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'

type ReminderTab = 'expiring' | 'expired'

const ReminderPage: React.FC = () => {
  const { policies, assets } = useInsuranceStore()
  const [tab, setTab] = useState<ReminderTab>('expiring')

  const reminderPolicies = useMemo(() => {
    if (tab === 'expiring') {
      return policies
        .filter((p) => p.status === 'expiring')
        .sort((a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix())
    }
    return policies
      .filter((p) => p.status === 'expired')
      .sort((a, b) => dayjs(b.endDate).unix() - dayjs(a.endDate).unix())
  }, [policies, tab])

  const expiringCount = policies.filter((p) => p.status === 'expiring').length
  const expiredCount = policies.filter((p) => p.status === 'expired').length

  const getRemainDays = (endDate: string) => dayjs(endDate).diff(dayjs(), 'day')

  const getAssetNames = (policyId: string) => {
    return assets
      .filter((a) => a.policyId === policyId)
      .map((a) => a.name)
      .join('、')
  }

  const handleRenew = (policy: { id: string; policyNo: string; companyName: string; premium: number; insuredAmount: number; category: string; assetIds: string[] }) => {
    Taro.navigateTo({
      url: `/pages/policyAdd/index?renewFrom=${policy.id}&policyNo=${encodeURIComponent(policy.policyNo)}&companyName=${encodeURIComponent(policy.companyName)}&premium=${policy.premium}&insuredAmount=${policy.insuredAmount}&category=${policy.category}`,
    })
  }

  const handleDetail = (policyId: string) => {
    Taro.navigateTo({ url: `/pages/policyDetail/index?id=${policyId}` })
  }

  const [showExportModal, setShowExportModal] = useState(false)

  const renewalList = useMemo(() => {
    return policies.filter((p) => p.status === 'expiring' || p.status === 'expired')
  }, [policies])

  const exportText = useMemo(() => {
    if (renewalList.length === 0) return ''
    const header = '保单号\t保险公司\t到期日\t保费\t保额\t关联资产'
    const rows = renewalList.map((p) => {
      const assetNames = getAssetNames(p.id) || '无'
      return `${p.policyNo}\t${p.companyName}\t${p.endDate}\t¥${p.premium.toLocaleString()}\t¥${p.insuredAmount.toLocaleString()}\t${assetNames}`
    })
    return [header, ...rows].join('\n')
  }, [renewalList, assets])

  const handleExport = () => {
    if (renewalList.length === 0) {
      Taro.showToast({ title: '暂无需要续保的保单', icon: 'none' })
      return
    }
    setShowExportModal(true)
  }

  const handleCopyExport = () => {
    Taro.setClipboardData({
      data: exportText,
      success: () => {
        Taro.showToast({ title: '已复制到剪贴板', icon: 'success' })
      },
      fail: (err) => {
        console.error('[Reminder] Copy failed:', err)
        Taro.showToast({ title: '复制失败', icon: 'none' })
      },
    })
  }

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{expiringCount}</Text>
          <Text className={styles.statLabel}>即将到期</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{expiredCount}</Text>
          <Text className={styles.statLabel}>已过期</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{expiringCount + expiredCount}</Text>
          <Text className={styles.statLabel}>需续保</Text>
        </View>
      </View>
      <View className={styles.tabRow}>
        <View
          className={`${styles.tabBtn} ${tab === 'expiring' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('expiring')}
        >
          <Text>即将到期</Text>
        </View>
        <View
          className={`${styles.tabBtn} ${tab === 'expired' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('expired')}
        >
          <Text>已过期</Text>
        </View>
      </View>
      <ScrollView scrollY style={{ height: 'calc(100vh - 380rpx)' }}>
        <View className={styles.listContent}>
          {reminderPolicies.length > 0 ? (
            reminderPolicies.map((policy) => {
              const remainDays = getRemainDays(policy.endDate)
              return (
                <View className={styles.reminderCard} key={policy.id}>
                  <View className={styles.reminderHeader}>
                    <Text className={styles.reminderPolicyNo}>{policy.policyNo}</Text>
                    <View
                      className={`${styles.reminderDays} ${remainDays <= 15 ? styles.reminderDaysUrgent : ''}`}
                    >
                      <Text>
                        {tab === 'expiring'
                          ? `剩余${remainDays}天`
                          : `已过期${Math.abs(remainDays)}天`}
                      </Text>
                    </View>
                  </View>
                  <Text className={styles.reminderCompany}>{policy.companyName}</Text>
                  <Text className={styles.reminderDate}>
                    到期日：{policy.endDate} | 保额：¥{policy.insuredAmount.toLocaleString()}
                  </Text>
                  <View className={styles.reminderActions}>
                    <View
                      className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                      onClick={() => handleRenew(policy)}
                    >
                      <Text>续保办理</Text>
                    </View>
                    <View
                      className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                      onClick={() => handleDetail(policy.id)}
                    >
                      <Text>查看详情</Text>
                    </View>
                  </View>
                </View>
              )
            })
          ) : (
            <EmptyState
              title={tab === 'expiring' ? '暂无即将到期保单' : '暂无过期保单'}
              description="所有保单状态正常"
            />
          )}
        </View>
      </ScrollView>
      <View className={styles.exportBtn} onClick={handleExport}>
        <Text>导出续保清单</Text>
      </View>

      {showExportModal && (
        <View className={styles.modalOverlay} onClick={() => setShowExportModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>续保清单</Text>
              <View className={styles.modalClose} onClick={() => setShowExportModal(false)}>
                <Text className={styles.modalCloseText}>✕</Text>
              </View>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {renewalList.map((p) => {
                const assetNames = getAssetNames(p.id)
                return (
                  <View className={styles.exportRow} key={p.id}>
                    <View className={styles.exportField}>
                      <Text className={styles.exportLabel}>保单号</Text>
                      <Text className={styles.exportValue}>{p.policyNo}</Text>
                    </View>
                    <View className={styles.exportField}>
                      <Text className={styles.exportLabel}>保险公司</Text>
                      <Text className={styles.exportValue}>{p.companyName}</Text>
                    </View>
                    <View className={styles.exportField}>
                      <Text className={styles.exportLabel}>到期日</Text>
                      <Text className={styles.exportValue}>{p.endDate}</Text>
                    </View>
                    <View className={styles.exportField}>
                      <Text className={styles.exportLabel}>保费</Text>
                      <Text className={styles.exportValue}>¥{p.premium.toLocaleString()}</Text>
                    </View>
                    <View className={styles.exportField}>
                      <Text className={styles.exportLabel}>保额</Text>
                      <Text className={styles.exportValue}>¥{p.insuredAmount.toLocaleString()}</Text>
                    </View>
                    <View className={styles.exportField}>
                      <Text className={styles.exportLabel}>关联资产</Text>
                      <Text className={styles.exportValue}>{assetNames || '无'}</Text>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.copyBtn} onClick={handleCopyExport}>
                <Text className={styles.copyBtnText}>复制清单内容</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ReminderPage
