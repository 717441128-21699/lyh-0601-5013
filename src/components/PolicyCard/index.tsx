import React from 'react'
import { View, Text } from '@tarojs/components'
import { Policy } from '@/types/policy'
import StatusTag from '@/components/StatusTag'
import dayjs from 'dayjs'
import styles from './index.module.scss'

interface PolicyCardProps {
  policy: Policy
  onClick?: () => void
}

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

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onClick }) => {
  const remainDays = dayjs(policy.endDate).diff(dayjs(), 'day')

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.policyNo}>{policy.policyNo}</Text>
          {policy.isKey && <Text className={styles.keyBadge}>重点</Text>}
        </View>
        <StatusTag type={policy.status} text={statusTextMap[policy.status]} />
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>保险公司</Text>
          <Text className={styles.value}>{policy.companyName}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>资产类别</Text>
          <Text className={styles.value}>{categoryTextMap[policy.category] || policy.category}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>保障期限</Text>
          <Text className={styles.value}>
            {policy.startDate} 至 {policy.endDate}
          </Text>
        </View>
      </View>
      <View className={styles.footer}>
        <View className={styles.amountGroup}>
          <View className={styles.amountItem}>
            <Text className={styles.amountLabel}>保费</Text>
            <Text className={styles.amountValue}>
              ¥{policy.premium.toLocaleString()}
            </Text>
          </View>
          <View className={styles.amountItem}>
            <Text className={styles.amountLabel}>保额</Text>
            <Text className={styles.amountValue}>
              ¥{policy.insuredAmount.toLocaleString()}
            </Text>
          </View>
        </View>
        {policy.status === 'expiring' && (
          <Text className={styles.remainDays}>剩余{remainDays}天</Text>
        )}
      </View>
    </View>
  )
}

export default PolicyCard
