import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import StatusTag from '@/components/StatusTag'
import ClaimCard from '@/components/ClaimCard'
import styles from './index.module.scss'

const statusTextMap: Record<string, string> = {
  active: '生效中',
  expiring: '即将到期',
  expired: '已过期',
  pending: '待生效',
}

const categoryTextMap: Record<string, string> = {
  equipment: '设备',
  vehicle: '车辆',
  valuable: '贵重物品',
}

const PolicyDetailPage: React.FC = () => {
  const router = useRouter()
  const policyId = router.params.id || ''
  const { policies, assets, claims } = useInsuranceStore()

  const policy = policies.find((p) => p.id === policyId)

  const relatedAssets = useMemo(
    () => assets.filter((a) => a.policyId === policyId),
    [assets, policyId]
  )

  const relatedClaims = useMemo(
    () => claims.filter((c) => c.policyId === policyId),
    [claims, policyId]
  )

  if (!policy) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>未找到保单信息</Text>
        </View>
      </View>
    )
  }

  const handleAssetClick = (assetId: string) => {
    Taro.navigateTo({ url: `/pages/assetDetail/index?id=${assetId}` })
  }

  const handleClaimClick = (claimId: string) => {
    console.info('[PolicyDetail] Click claim:', claimId)
  }

  const handleAddClaim = () => {
    Taro.navigateTo({ url: '/pages/claimAdd/index' })
  }

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.header}>
          <View className={styles.headerTop}>
            <Text className={styles.policyNo}>{policy.policyNo}</Text>
            <StatusTag type={policy.status} text={statusTextMap[policy.status]} />
          </View>
          <Text className={styles.companyName}>{policy.companyName}</Text>
          <View className={styles.amountRow}>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>保费</Text>
              <Text className={styles.amountValue}>¥{policy.premium.toLocaleString()}</Text>
            </View>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>保额</Text>
              <Text className={styles.amountValue}>¥{policy.insuredAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>保单信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>资产类别</Text>
            <Text className={styles.infoValue}>{categoryTextMap[policy.category] || policy.category}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>保障期限</Text>
            <Text className={styles.infoValue}>{policy.startDate} 至 {policy.endDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>备注</Text>
            <Text className={styles.infoValue}>{policy.remark || '无'}</Text>
          </View>
          {policy.isKey && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>标记</Text>
              <Text className={styles.infoValue} style={{ color: '#D69E2E' }}>重点保障</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>关联资产 ({relatedAssets.length})</Text>
          {relatedAssets.length > 0 ? (
            relatedAssets.map((asset) => (
              <View
                key={asset.id}
                className={styles.assetItem}
                onClick={() => handleAssetClick(asset.id)}
              >
                <View className={styles.assetInfo}>
                  <Text className={styles.assetName}>{asset.name}</Text>
                  <Text className={styles.assetModel}>{asset.model}</Text>
                </View>
                <Text className={styles.assetPrice}>¥{asset.purchasePrice.toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text className={styles.emptyCardText}>暂无关联资产</Text>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitleRow}>
            <Text className={styles.cardTitle}>理赔记录 ({relatedClaims.length})</Text>
            <View className={styles.addClaimBtn} onClick={handleAddClaim}>
              <Text className={styles.addClaimBtnText}>+ 登记</Text>
            </View>
          </View>
          {relatedClaims.length > 0 ? (
            relatedClaims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                onClick={() => handleClaimClick(claim.id)}
              />
            ))
          ) : (
            <Text className={styles.emptyCardText}>暂无理赔记录</Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default PolicyDetailPage
