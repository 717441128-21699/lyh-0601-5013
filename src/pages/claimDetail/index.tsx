import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Image, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useInsuranceStore } from '@/store'
import StatusTag from '@/components/StatusTag'
import { ClaimStatus } from '@/types/claim'
import styles from './index.module.scss'

const STATUS_OPTIONS = ['已报案', '处理中', '已审批', '已到账', '已拒赔']
const STATUS_MAP: Record<number, ClaimStatus> = {
  0: 'reported',
  1: 'processing',
  2: 'approved',
  3: 'paid',
  4: 'rejected',
}
const REVERSE_STATUS_MAP: Record<ClaimStatus, number> = {
  reported: 0,
  processing: 1,
  approved: 2,
  paid: 3,
  rejected: 4,
}

const statusTextMap: Record<string, string> = {
  reported: '已报案',
  processing: '处理中',
  approved: '已审批',
  paid: '已到账',
  rejected: '已拒赔',
}

const ClaimDetailPage: React.FC = () => {
  const router = useRouter()
  const claimId = router.params.id || ''
  const { claims, policies, updateClaim } = useInsuranceStore()

  const claim = claims.find((c) => c.id === claimId)
  const policy = useMemo(
    () => policies.find((p) => p.id === claim?.policyId),
    [policies, claim]
  )

  const [statusIdx, setStatusIdx] = useState<number>(
    claim ? REVERSE_STATUS_MAP[claim.status] ?? 0 : 0
  )
  const [receivedAmount, setReceivedAmount] = useState<string>(
    claim ? String(claim.receivedAmount) : ''
  )
  const [remark, setRemark] = useState<string>(claim?.remark || '')

  if (!claim) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyText}>未找到理赔记录</Text>
        </View>
      </View>
    )
  }

  const handlePreviewPhoto = (src: string) => {
    Taro.previewImage({
      current: src,
      urls: claim.scenePhotos || [],
    })
  }

  const handleSave = () => {
    updateClaim(claim.id, {
      status: STATUS_MAP[statusIdx],
      receivedAmount: Number(receivedAmount) || 0,
      remark: remark.trim(),
    })
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1200)
  }

  const handlePolicyClick = () => {
    if (policy) {
      Taro.navigateTo({ url: `/pages/policyDetail/index?id=${policy.id}` })
    }
  }

  return (
    <View className={styles.container}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.header}>
          <View className={styles.headerTop}>
            <Text className={styles.assetName}>{claim.assetName}</Text>
            <StatusTag type={claim.status} text={statusTextMap[claim.status]} />
          </View>
          <Text className={styles.policyLine} onClick={handlePolicyClick}>
            关联保单：{claim.policyNo}{policy ? `（${policy.companyName}）` : ''}
          </Text>
          <View className={styles.amountRow}>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>理赔金额</Text>
              <Text className={styles.amountValue}>¥{claim.claimAmount.toLocaleString()}</Text>
            </View>
            <View className={styles.amountItem}>
              <Text className={styles.amountLabel}>已到账</Text>
              <Text className={`${styles.amountValue} ${claim.receivedAmount > 0 ? styles.amountValueGreen : ''}`}>
                ¥{claim.receivedAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>理赔信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>报案时间</Text>
            <Text className={styles.infoValue}>{claim.reportTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>损失说明</Text>
            <Text className={styles.infoValueText}>{claim.lossDescription}</Text>
          </View>
        </View>

        {claim.scenePhotos && claim.scenePhotos.length > 0 && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>现场照片 ({claim.scenePhotos.length})</Text>
            <View className={styles.photoGrid}>
              {claim.scenePhotos.map((src, idx) => (
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
          <Text className={styles.cardTitle}>进度更新</Text>
          <View className={styles.formGroup}>
            <Text className={styles.label}>理赔进度</Text>
            <Picker
              mode="selector"
              range={STATUS_OPTIONS}
              value={statusIdx}
              onChange={(e) => setStatusIdx(Number(e.detail.value))}
            >
              <View className={styles.pickerValue}>
                <Text>{STATUS_OPTIONS[statusIdx]}</Text>
              </View>
            </Picker>
          </View>
          <View className={styles.formGroup}>
            <Text className={styles.label}>到账金额 (元)</Text>
            <Input
              className={styles.input}
              type="digit"
              placeholder="请输入到账金额"
              value={receivedAmount}
              onInput={(e) => setReceivedAmount(e.detail.value)}
            />
          </View>
          <View className={styles.formGroup}>
            <Text className={styles.label}>备注</Text>
            <Input
              className={styles.input}
              placeholder="请输入备注"
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
            />
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>保存更新</Text>
        </View>
      </View>
    </View>
  )
}

export default ClaimDetailPage
