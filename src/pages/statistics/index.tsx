import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import StatCard from '@/components/StatCard'
import styles from './index.module.scss'

const categoryLabels: Record<string, string> = {
  equipment: '设备',
  vehicle: '车辆',
  valuable: '贵重物品',
}

const categoryBarStyles: Record<string, string> = {
  equipment: styles.categoryBarBlue,
  vehicle: styles.categoryBarGreen,
  valuable: styles.categoryBarOrange,
}

const claimStatusText: Record<string, string> = {
  reported: '已报案',
  processing: '处理中',
  approved: '已审批',
  paid: '已到账',
  rejected: '已拒赔',
}

const StatisticsPage: React.FC = () => {
  const { policies, assets, claims } = useInsuranceStore()

  const totalPremium = useMemo(
    () => policies.reduce((sum, p) => sum + p.premium, 0),
    [policies]
  )

  const totalInsuredAmount = useMemo(
    () => policies.reduce((sum, p) => sum + p.insuredAmount, 0),
    [policies]
  )

  const totalClaimAmount = useMemo(
    () => claims.reduce((sum, c) => sum + c.claimAmount, 0),
    [claims]
  )

  const totalReceived = useMemo(
    () => claims.reduce((sum, c) => sum + c.receivedAmount, 0),
    [claims]
  )

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { equipment: 0, vehicle: 0, valuable: 0 }
    policies.forEach((p) => {
      if (stats[p.category] !== undefined) {
        stats[p.category] += p.premium
      }
    })
    return stats
  }, [policies])

  const maxCategoryPremium = Math.max(...Object.values(categoryStats), 1)

  const recentClaims = useMemo(
    () => [...claims].sort((a, b) => b.reportTime.localeCompare(a.reportTime)).slice(0, 5),
    [claims]
  )

  const activePolicyCount = policies.filter((p) => p.status === 'active').length
  const uninsuredCount = assets.filter((a) => !a.isInsured).length

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.overviewCard}>
          <Text className={styles.overviewTitle}>保险总览</Text>
          <View className={styles.overviewGrid}>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{activePolicyCount}</Text>
              <Text className={styles.overviewLabel}>生效保单</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                ¥{(totalPremium / 10000).toFixed(1)}万
              </Text>
              <Text className={styles.overviewLabel}>年度保费</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>
                ¥{(totalInsuredAmount / 10000).toFixed(0)}万
              </Text>
              <Text className={styles.overviewLabel}>总保额</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{uninsuredCount}</Text>
              <Text className={styles.overviewLabel}>未投保资产</Text>
            </View>
          </View>
        </View>

        <Text className={styles.sectionTitle}>按类别统计保费</Text>
        <View className={styles.card}>
          {Object.entries(categoryStats).map(([key, value]) => (
            <View className={styles.categoryItem} key={key}>
              <Text className={styles.categoryLabel}>{categoryLabels[key]}</Text>
              <View className={styles.categoryBarBg}>
                <View
                  className={`${styles.categoryBarFill} ${categoryBarStyles[key] || styles.categoryBarBlue}`}
                  style={{ width: `${(value / maxCategoryPremium) * 100}%` }}
                />
              </View>
              <Text className={styles.categoryValue}>¥{value.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <Text className={styles.sectionTitle}>理赔数据</Text>
        <View style={{ display: 'flex', gap: '24rpx', padding: '0 32rpx', marginBottom: '24rpx' }}>
          <View style={{ flex: 1 }}>
            <StatCard label="理赔总额" value={`¥${(totalClaimAmount / 10000).toFixed(1)}万`} type="error" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="已到账" value={`¥${(totalReceived / 10000).toFixed(1)}万`} type="success" />
          </View>
        </View>

        <Text className={styles.sectionTitle}>最近理赔</Text>
        <View className={styles.card}>
          {recentClaims.length > 0 ? (
            recentClaims.map((claim) => (
              <View
                className={styles.claimHistoryItem}
                key={claim.id}
                onClick={() => Taro.navigateTo({ url: `/pages/claimDetail/index?id=${claim.id}` })}
              >
                <View className={styles.claimHistoryLeft}>
                  <View className={styles.claimHistoryTop}>
                    <Text className={styles.claimHistoryAsset}>{claim.assetName}</Text>
                    {claim.scenePhotos && claim.scenePhotos.length > 0 && (
                      <Text className={styles.claimPhotoTag}>📷 {claim.scenePhotos.length}</Text>
                    )}
                  </View>
                  <Text className={styles.claimHistoryDate}>{claim.reportTime}</Text>
                </View>
                <View className={styles.claimHistoryRight}>
                  <Text className={styles.claimHistoryAmount}>
                    ¥{claim.claimAmount.toLocaleString()}
                  </Text>
                  <Text className={styles.claimHistoryStatus}>
                    {claimStatusText[claim.status] || claim.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={{ textAlign: 'center', padding: '48rpx 0' }}>
              <Text style={{ fontSize: '24rpx', color: '#A0AEC0' }}>暂无理赔记录</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default StatisticsPage
