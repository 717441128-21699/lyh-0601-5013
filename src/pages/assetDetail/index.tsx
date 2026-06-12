import React, { useMemo, useState } from 'react'
import { View, Text, Picker, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

const categoryTextMap: Record<string, string> = {
  equipment: '设备',
  vehicle: '车辆',
  valuable: '贵重物品',
}

const AssetDetailPage: React.FC = () => {
  const router = useRouter()
  const assetId = router.params.id || ''
  const { assets, policies, bindPolicyToAsset, unbindPolicyFromAsset } = useInsuranceStore()

  const asset = assets.find((a) => a.id === assetId)
  const currentPolicy = asset?.policyId ? policies.find((p) => p.id === asset.policyId) : null
  const availablePolicies = policies.filter((p) => p.status === 'active' || p.status === 'expiring')

  const [pickerIdx, setPickerIdx] = useState(0)
  const [showBindModal, setShowBindModal] = useState(false)

  const handleBind = () => {
    if (availablePolicies.length === 0) {
      Taro.showToast({ title: '没有可用的保单', icon: 'none' })
      return
    }
    setShowBindModal(true)
  }

  const handleConfirmBind = () => {
    const selectedPolicy = availablePolicies[pickerIdx]
    if (!selectedPolicy) return
    bindPolicyToAsset(assetId, selectedPolicy.id)
    setShowBindModal(false)
    Taro.showToast({ title: '已绑定保单', icon: 'success' })
  }

  const handleUnbind = () => {
    unbindPolicyFromAsset(assetId)
    Taro.showToast({ title: '已取消投保', icon: 'success' })
  }

  if (!asset) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>未找到资产信息</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.header}>
          <Text className={styles.assetName}>{asset.name}</Text>
          <View className={styles.tagRow}>
            <View className={styles.categoryTag}>
              <Text className={styles.categoryTagText}>{categoryTextMap[asset.category]}</Text>
            </View>
            {asset.isInsured ? (
              <StatusTag type="active" text="已投保" />
            ) : (
              <StatusTag type="expired" text="未投保" />
            )}
            {asset.isKey && <StatusTag type="expiring" text="重点保障" />}
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>基本信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>型号</Text>
            <Text className={styles.infoValue}>{asset.model}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>购入日期</Text>
            <Text className={styles.infoValue}>{asset.purchaseDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>购入价格</Text>
            <Text className={styles.infoValue}>¥{asset.purchasePrice.toLocaleString()}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>存放位置</Text>
            <Text className={styles.infoValue}>{asset.location}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>投保信息</Text>
          {currentPolicy ? (
            <View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>保单号</Text>
                <Text className={styles.infoValue}>{currentPolicy.policyNo}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>保险公司</Text>
                <Text className={styles.infoValue}>{currentPolicy.companyName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>保障期限</Text>
                <Text className={styles.infoValue}>{currentPolicy.startDate} 至 {currentPolicy.endDate}</Text>
              </View>
              <View className={styles.unbindBtn} onClick={handleUnbind}>
                <Text className={styles.unbindBtnText}>取消投保关系</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className={styles.noPolicyText}>该资产暂未投保</Text>
              <View className={styles.bindBtn} onClick={handleBind}>
                <Text className={styles.bindBtnText}>绑定保单</Text>
              </View>
            </View>
          )}
          {currentPolicy && (
            <View className={styles.changeBtn} onClick={handleBind}>
              <Text className={styles.changeBtnText}>更换保单</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showBindModal && (
        <View className={styles.modalOverlay} onClick={() => setShowBindModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择保单</Text>
              <View className={styles.modalClose} onClick={() => setShowBindModal(false)}>
                <Text className={styles.modalCloseText}>✕</Text>
              </View>
            </View>
            <Picker
              mode="selector"
              range={availablePolicies.map((p) => `${p.policyNo} - ${p.companyName}`)}
              value={pickerIdx}
              onChange={(e) => setPickerIdx(Number(e.detail.value))}
            >
              <View className={styles.pickerValue}>
                <Text>{availablePolicies[pickerIdx]?.policyNo} - {availablePolicies[pickerIdx]?.companyName}</Text>
              </View>
            </Picker>
            <View className={styles.modalActions}>
              <View className={styles.modalCancel} onClick={() => setShowBindModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalConfirm} onClick={handleConfirmBind}>
                <Text>确认绑定</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default AssetDetailPage
