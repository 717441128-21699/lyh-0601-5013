import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import StatusTag from '@/components/StatusTag'
import ClaimCard from '@/components/ClaimCard'
import styles from './index.module.scss'

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

const PolicyDetailPage: React.FC = () => {
  const router = useRouter()
  const policyId = router.params.id || ''
  const { policies, assets, claims, bindPolicyToAsset, unbindPolicyFromAsset } = useInsuranceStore()
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [pendingAssetIds, setPendingAssetIds] = useState<string[]>([])

  const policy = policies.find((p) => p.id === policyId)

  const relatedAssets = useMemo(
    () => assets.filter((a) => a.policyId === policyId),
    [assets, policyId]
  )

  const relatedClaims = useMemo(
    () => claims.filter((c) => c.policyId === policyId),
    [claims, policyId]
  )

  const availableAssets = useMemo(
    () => assets.filter((a) => !a.isInsured || a.policyId === policyId),
    [assets, policyId]
  )

  if (!policy) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>未找到保单信息</Text>
        </View>
      </View>
    )
  }

  const handleAssetClick = (assetId: string) => {
    Taro.navigateTo({ url: `/pages/assetDetail/index?id=${assetId}` })
  }

  const handleClaimClick = (claimId: string) => {
    Taro.navigateTo({ url: `/pages/claimDetail/index?id=${claimId}` })
  }

  const handleAddClaim = () => {
    Taro.navigateTo({ url: '/pages/claimAdd/index' })
  }

  const handlePreviewPhoto = (src: string) => {
    Taro.previewImage({
      current: src,
      urls: policy.contractPhotos || [],
    })
  }

  const openAssetPicker = () => {
    setPendingAssetIds(relatedAssets.map((a) => a.id))
    setShowAssetPicker(true)
  }

  const togglePendingAsset = (assetId: string) => {
    setPendingAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    )
  }

  const handleRemoveAsset = (assetId: string) => {
    Taro.showModal({
      title: '移除关联资产',
      content: '确定要移除该资产的投保关系吗？',
      success: (res) => {
        if (res.confirm) {
          unbindPolicyFromAsset(assetId)
          Taro.showToast({ title: '已移除', icon: 'success' })
        }
      },
    })
  }

  const confirmAssetSelection = () => {
    const currentIds = relatedAssets.map((a) => a.id)
    const toAdd = pendingAssetIds.filter((id) => !currentIds.includes(id))
    const toRemove = currentIds.filter((id) => !pendingAssetIds.includes(id))

    toAdd.forEach((id) => bindPolicyToAsset(id, policyId))
    toRemove.forEach((id) => unbindPolicyFromAsset(id))

    setShowAssetPicker(false)
    Taro.showToast({ title: '已更新关联资产', icon: 'success' })
  }

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.header}>
          <View className={styles.headerTop}>
            <Text className={styles.policyNo}>{policy.policyNo}</Text>
            <StatusTag type={policy.status} text={statusTextMap[policy.status]} />
          </View>
          <Text className={styles.companyName}>{policy.companyName}</Text>
          <View className={styles.amountRow}>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>保费</Text>
              <Text className={styles.amountValue}>¥{policy.premium.toLocaleString()}</Text>
            </View>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>保额</Text>
              <Text className={styles.amountValue}>¥{policy.insuredAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>保单信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>资产类别</Text>
            <Text className={styles.infoValue}>{categoryTextMap[policy.category] || policy.category}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>保障期限</Text>
            <Text className={styles.infoValue}>{policy.startDate} 至 {policy.endDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>备注</Text>
            <Text className={styles.infoValue}>{policy.remark || '无'}</Text>
          </View>
          {policy.isKey && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>标记</Text>
              <Text className={styles.infoValue} style={{ color: '#D69E2E' }}>重点保障</Text>
            </View>
          )}
        </View>

        {policy.contractPhotos && policy.contractPhotos.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>合同照片 ({policy.contractPhotos.length})</Text>
            <View className={styles.photoGrid}>
              {policy.contractPhotos.map((src, idx) => (
                <Image
                  key={idx}
                  className={styles.photoThumb}
                  src={src}
                  mode="aspectFill"
                  onClick={() => handlePreviewPhoto(src)}
                />
              ))}
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardTitleRow}>
            <Text className={styles.cardTitle}>关联资产 ({relatedAssets.length})</Text>
            <View className={styles.linkBtn} onClick={openAssetPicker}>
              <Text className={styles.linkBtnText}>批量管理</Text>
            </View>
          </View>
          {relatedAssets.length > 0 ? (
            relatedAssets.map((asset) => (
              <View key={asset.id} className={styles.assetItem}>
                <View className={styles.assetInfo} onClick={() => handleAssetClick(asset.id)}>
                  <Text className={styles.assetName}>{asset.name}</Text>
                  <Text className={styles.assetModel}>{asset.model}</Text>
                </View>
                <View className={styles.assetRight}>
                  <Text className={styles.assetPrice}>¥{asset.purchasePrice.toLocaleString()}</Text>
                  <View className={styles.removeBtn} onClick={() => handleRemoveAsset(asset.id)}>
                    <Text className={styles.removeBtnText}>移除</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.emptyBlock}>
              <Text className={styles.emptyCardText}>暂无关联资产</Text>
              <View className={styles.primaryBtn} onClick={openAssetPicker}>
                <Text className={styles.primaryBtnText}>添加关联资产</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitleRow}>
            <Text className={styles.cardTitle}>理赔记录 ({relatedClaims.length})</Text>
            <View className={styles.addClaimBtn} onClick={handleAddClaim}>
              <Text className={styles.addClaimBtnText}>+ 登记</Text>
            </View>
          </View>
          {relatedClaims.length > 0 ? (
            relatedClaims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                onClick={() => handleClaimClick(claim.id)}
              />
            ))
          ) : (
            <Text className={styles.emptyCardText}>暂无理赔记录</Text>
          )}
        </View>
      </ScrollView>

      {showAssetPicker && (
        <View className={styles.modalOverlay} onClick={() => setShowAssetPicker(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>关联资产管理</Text>
              <View className={styles.modalClose} onClick={() => setShowAssetPicker(false)}>
                <Text className={styles.modalCloseText}>×</Text>
              </View>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {availableAssets.length > 0 ? (
                availableAssets.map((asset) => (
                  <View
                    key={asset.id}
                    className={`${styles.modalItem} ${pendingAssetIds.includes(asset.id) ? styles.modalItemSelected : ''}`}
                    onClick={() => togglePendingAsset(asset.id)}
                  >
                    <View className={styles.modalItemInfo}>
                      <Text className={styles.modalItemName}>{asset.name}</Text>
                      <Text className={styles.modalItemModel}>{asset.model}</Text>
                    </View>
                    {pendingAssetIds.includes(asset.id) && (
                      <Text className={styles.modalCheck}>✓</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text className={styles.emptyCardText}>暂无可关联的资产</Text>
              )}
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={styles.modalCancel} onClick={() => setShowAssetPicker(false)}>
                <Text className={styles.modalCancelText}>取消</Text>
              </View>
              <View className={styles.modalConfirm} onClick={confirmAssetSelection}>
                <Text className={styles.modalConfirmText}>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default PolicyDetailPage
