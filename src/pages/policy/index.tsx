import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import PolicyCard from '@/components/PolicyCard'
import EmptyState from '@/components/EmptyState'
import { PolicyStatus } from '@/types/policy'
import styles from './index.module.scss'

const FILTER_OPTIONS: { key: PolicyStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '生效中' },
  { key: 'expiring', label: '即将到期' },
  { key: 'expired', label: '已过期' },
  { key: 'pending', label: '待生效' },
]

const PolicyPage: React.FC = () => {
  const { policies } = useInsuranceStore()
  const [searchText, setSearchText] = useState('')
  const [filterStatus, setFilterStatus] = useState<PolicyStatus | 'all'>('all')

  const filteredPolicies = useMemo(() => {
    let result = policies
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus)
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.policyNo.toLowerCase().includes(keyword) ||
          p.companyName.toLowerCase().includes(keyword) ||
          p.remark.toLowerCase().includes(keyword)
      )
    }
    return result
  }, [policies, filterStatus, searchText])

  const handlePolicyClick = (policyId: string) => {
    Taro.navigateTo({ url: `/pages/policyDetail/index?id=${policyId}` })
  }

  const handleAddPolicy = () => {
    Taro.navigateTo({ url: '/pages/policyAdd/index' })
  }

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <Input
          className={styles.searchInput}
          placeholder="搜索保单号、保险公司"
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>
      <View className={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <View
            key={opt.key}
            className={`${styles.filterBtn} ${filterStatus === opt.key ? styles.filterBtnActive : ''}`}
            onClick={() => setFilterStatus(opt.key)}
          >
            <Text>{opt.label}</Text>
          </View>
        ))}
      </View>
      <View className={styles.summaryBar}>
        <Text className={styles.summaryText}>
          共 <Text className={styles.summaryCount}>{filteredPolicies.length}</Text> 条保单
        </Text>
      </View>
      <ScrollView scrollY className={styles.listContent} style={{ height: 'calc(100vh - 320rpx)' }}>
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onClick={() => handlePolicyClick(policy.id)}
            />
          ))
        ) : (
          <EmptyState title="暂无保单" description="点击右下角按钮新增保单" />
        )}
      </ScrollView>
      <View className={styles.addButton} onClick={handleAddPolicy}>
        <Text className={styles.addIcon}>+</Text>
      </View>
    </View>
  )
}

export default PolicyPage
