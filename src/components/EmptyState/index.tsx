import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface EmptyStateProps {
  title: string
  description?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <View className={styles.container}>
      <Text className={styles.icon}>📋</Text>
      <Text className={styles.title}>{title}</Text>
      {description && <Text className={styles.desc}>{description}</Text>}
    </View>
  )
}

export default EmptyState
