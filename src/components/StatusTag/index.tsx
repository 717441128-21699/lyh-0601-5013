import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusTagProps {
  type: 'active' | 'expiring' | 'expired' | 'pending' | 'reported' | 'processing' | 'approved' | 'paid' | 'rejected'
  text: string
}

const typeColorMap: Record<string, string> = {
  active: styles.tagGreen,
  expiring: styles.tagOrange,
  expired: styles.tagRed,
  pending: styles.tagBlue,
  reported: styles.tagBlue,
  processing: styles.tagOrange,
  approved: styles.tagGreen,
  paid: styles.tagGreen,
  rejected: styles.tagRed,
}

const StatusTag: React.FC<StatusTagProps> = ({ type, text }) => {
  return (
    <View className={classnames(styles.tag, typeColorMap[type] || styles.tagBlue)}>
      <Text className={styles.tagText}>{text}</Text>
    </View>
  )
}

export default StatusTag
