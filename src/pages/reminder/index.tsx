import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import { useInsuranceStore } from '@/store'
import EmptyState from '@/components/EmptyState'
import styles from './index.module.scss'

type ReminderTab = 'expiring' | 'expired'

const ReminderPage: React.FC = () => {
  const { policies } = useInsuranceStore()
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

  const handleRenew = (policyId: string) => {
    Taro.navigateTo({ url: `/pages/policyDetail/index?id=${policyId}` })
  }

  const handleExport = () => {
    const renewalList = policies.filter((p) => p.status === 'expiring' || p.status === 'expired')
    console.info('[Reminder] Export renewal list:', renewalList.length)
    Taro.showToast({ title: '续保清单已导出', icon: 'success' })
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
          <Text className={styles.statLabel">需续保</Text>
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
                      onClick={() => handleRenew(policy.id)}
                    >
                      <Text>续保办理</Text>
                    </View>
                    <View
                      className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                      onClick={() => handleRenew(policy.id)}
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
    </View>
  )
}

export default ReminderPage
