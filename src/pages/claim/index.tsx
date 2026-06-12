import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import ClaimCard from '@/components/ClaimCard'
import EmptyState from '@/components/EmptyState'
import { ClaimStatus } from '@/types/claim'
import styles from './index.module.scss'

const STATUS_FILTERS: { key: ClaimStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'reported', label: '已报案' },
  { key: 'processing', label: '处理中' },
  { key: 'approved', label: '已审批' },
  { key: 'paid', label: '已到账' },
  { key: 'rejected', label: '已拒赔' },
]

const ClaimPage: React.FC = () => {
  const { claims } = useInsuranceStore()
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | 'all'>('all')

  const filteredClaims = useMemo(() => {
    if (filterStatus === 'all') return claims
    return claims.filter((c) => c.status === filterStatus)
  }, [claims, filterStatus])

  const totalClaimAmount = claims.reduce((sum, c) => sum + c.claimAmount, 0)
  const totalReceived = claims.reduce((sum, c) => sum + c.receivedAmount, 0)
  const processingCount = claims.filter((c) => c.status === 'processing' || c.status === 'reported').length

  const handleClaimClick = (claimId: string) => {
    Taro.navigateTo({ url: `/pages/claimDetail/index?id=${claimId}` })
  }

  const handleAddClaim = () => {
    Taro.navigateTo({ url: '/pages/claimAdd/index' })
  }

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{claims.length}</Text>
          <Text className={styles.statLabel}>理赔总数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>¥{(totalClaimAmount / 10000).toFixed(1)}万</Text>
          <Text className={styles.statLabel}>理赔总额</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>¥{(totalReceived / 10000).toFixed(1)}万</Text>
          <Text className={styles.statLabel}>已到账</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{processingCount}</Text>
          <Text className={styles.statLabel}>处理中</Text>
        </View>
      </View>
      <View className={styles.filterRow}>
        {STATUS_FILTERS.map((opt) => (
          <View
            key={opt.key}
            className={`${styles.filterBtn} ${filterStatus === opt.key ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus(opt.key)}
          >
            <Text>{opt.label}</Text>
          </View>
        ))}
      </View>
      <ScrollView scrollY style={{ height: 'calc(100vh - 400rpx)' }}>
        <View className={styles.listContent}>
          {filteredClaims.length > 0 ? (
            filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                onClick={() => handleClaimClick(claim.id)}
              />
            ))
          ) : (
            <EmptyState title="暂无理赔记录" description="点击右下角按钮登记理赔" />
          )}
        </View>
      </ScrollView>
      <View className={styles.addButton} onClick={handleAddClaim}>
        <Text className={styles.addIcon}>+</Text>
      </View>
    </View>
  )
}

export default ClaimPage
