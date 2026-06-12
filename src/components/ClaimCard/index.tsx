import React from 'react'
import { View, Text } from '@tarojs/components'
import { Claim } from '@/types/claim'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

interface ClaimCardProps {
  claim: Claim
  onClick?: () => void
}

const statusTextMap: Record<string, string> = {
  reported: '已报案',
  processing: '处理中',
  approved: '已审批',
  paid: '已到账',
  rejected: '已拒赔',
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.assetName}>{claim.assetName}</Text>
          {claim.scenePhotos && claim.scenePhotos.length > 0 && (
            <View className={styles.photoBadge}>
              <Text className={styles.photoBadgeText}>📷 {claim.scenePhotos.length}</Text>
            </View>
          )}
        </View>
        <StatusTag type={claim.status} text={statusTextMap[claim.status]} />
      </View>
      <View className={styles.body}>
        <Text className={styles.description} numberOfLines={2}>
          {claim.lossDescription}
        </Text>
      </View>
      <View className={styles.footer}>
        <View className={styles.infoGroup}>
          <Text className={styles.infoLabel}>报案时间</Text>
          <Text className={styles.infoValue}>{claim.reportTime}</Text>
        </View>
        <View className={styles.infoGroup}>
          <Text className={styles.infoLabel}>理赔金额</Text>
          <Text className={styles.claimAmount}>¥{claim.claimAmount.toLocaleString()}</Text>
        </View>
        {claim.receivedAmount > 0 && (
          <View className={styles.infoGroup}>
            <Text className={styles.infoLabel}>到账金额</Text>
            <Text className={styles.receivedAmount}>¥{claim.receivedAmount.toLocaleString()}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default ClaimCard
