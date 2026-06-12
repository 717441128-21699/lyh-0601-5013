import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  type?: 'primary' | 'success' | 'warning' | 'error'
}

const typeStyleMap: Record<string, string> = {
  primary: styles.valuePrimary,
  success: styles.valueSuccess,
  warning: styles.valueWarning,
  error: styles.valueError,
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, type = 'primary' }) => {
  return (
    <View className={styles.card}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.valueRow}>
        <Text className={classnames(styles.value, typeStyleMap[type])}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
    </View>
  )
}

export default StatCard
