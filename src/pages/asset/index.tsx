import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import AssetCard from '@/components/AssetCard'
import EmptyState from '@/components/EmptyState'
import { AssetCategory } from '@/types/asset'
import styles from './index.module.scss'

const CATEGORY_TABS: { key: AssetCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'equipment', label: '设备' },
  { key: 'vehicle', label: '车辆' },
  { key: 'valuable', label: '贵重物品' },
]

const AssetPage: React.FC = () => {
  const { assets, toggleAssetKey } = useInsuranceStore()
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all')
  const [showUninsured, setShowUninsured] = useState(false)

  const filteredAssets = useMemo(() => {
    let result = assets
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter)
    }
    if (showUninsured) {
      result = result.filter((a) => !a.isInsured)
    }
    return result
  }, [assets, categoryFilter, showUninsured])

  const insuredCount = assets.filter((a) => a.isInsured).length
  const uninsuredCount = assets.filter((a) => !a.isInsured).length
  const keyCount = assets.filter((a) => a.isKey).length

  const handleAssetClick = (assetId: string) => {
    Taro.navigateTo({ url: `/pages/assetDetail/index?id=${assetId}` })
  }

  const handleToggleKey = (assetId: string) => {
    toggleAssetKey(assetId)
    Taro.showToast({ title: '已更新', icon: 'success' })
  }

  return (
    <View className={styles.container}>
      <View className={styles.tabRow}>
        {CATEGORY_TABS.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tabBtn} ${categoryFilter === tab.key && !showUninsured ? styles.tabBtnActive : ''}`}
            onClick={() => {
              setCategoryFilter(tab.key)
              setShowUninsured(false)
            }}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>
      <View className={styles.summaryBar}>
        <View className={styles.summaryLeft}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>已投保</Text>
            <Text className={styles.summaryValue}>{insuredCount}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>未投保</Text>
            <Text className={styles.summaryValue} style={{ color: '#E53E3E' }}>
              {uninsuredCount}
            </Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>重点</Text>
            <Text className={styles.summaryValue} style={{ color: '#D69E2E' }}>
              {keyCount}
            </Text>
          </View>
        </View>
        <View
          className={`${styles.uninsuredBtn} ${showUninsured ? styles.tabBtnActive : ''}`}
          onClick={() => setShowUninsured(!showUninsured)}
          style={showUninsured ? { background: '#E53E3E', color: '#fff' } : {}}
        >
          <Text>{showUninsured ? '查看全部' : '未投保筛查'}</Text>
        </View>
      </View>
      <ScrollView scrollY style={{ height: 'calc(100vh - 300rpx)' }}>
        <View className={styles.listContent}>
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => handleAssetClick(asset.id)}
                onToggleKey={() => handleToggleKey(asset.id)}
              />
            ))
          ) : (
            <EmptyState
              title={showUninsured ? '无未投保资产' : '暂无资产'}
              description={showUninsured ? '所有资产均已投保' : '请先添加资产信息'}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default AssetPage
