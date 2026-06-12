import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Asset } from '@/types/asset'
import StatusTag from '@/components/StatusTag'
import classnames from 'classnames'
import styles from './index.module.scss'

interface AssetCardProps {
  asset: Asset
  onClick?: () => void
  onToggleKey?: () => void
}

const categoryTextMap: Record<string, string> = {
  equipment: '设备',
  vehicle: '车辆',
  valuable: '贵重物品',
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, onToggleKey }) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <Image
        className={styles.thumbnail}
        src={asset.thumbnail}
        mode="aspectFill"
      />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{asset.name}</Text>
          {asset.isKey && <Text className={styles.keyBadge}>重点保障</Text>}
        </View>
        <View className={styles.metaRow}>
          <Text className={styles.category}>
            {categoryTextMap[asset.category] || asset.category}
          </Text>
          <Text className={styles.model}>{asset.model}</Text>
        </View>
        <View className={styles.bottomRow}>
          <Text className={styles.price}>¥{asset.purchasePrice.toLocaleString()}</Text>
          {asset.isInsured ? (
            <StatusTag type="active" text="已投保" />
          ) : (
            <StatusTag type="expired" text="未投保" />
          )}
        </View>
      </View>
      <View
        className={classnames(styles.keyToggle, asset.isKey && styles.keyToggleActive)}
        onClick={(e) => {
          e.stopPropagation()
          onToggleKey?.()
        }}
      >
        <Text className={styles.keyToggleIcon}>{asset.isKey ? '★' : '☆'}</Text>
      </View>
    </View>
  )
}

export default AssetCard
