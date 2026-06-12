import React, { useState } from 'react'
import { View, Text, Input, Picker, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import { useInsuranceStore } from '@/store'
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

const ClaimAddPage: React.FC = () => {
  const { policies, addClaim } = useInsuranceStore()
  const activePolicies = policies.filter((p) => p.status === 'active' || p.status === 'expiring')

  const [policyIdx, setPolicyIdx] = useState(0)
  const [assetName, setAssetName] = useState('')
  const [lossDescription, setLossDescription] = useState('')
  const [reportTime, setReportTime] = useState(dayjs().format('YYYY-MM-DD HH:mm'))
  const [statusIdx, setStatusIdx] = useState(0)
  const [claimAmount, setClaimAmount] = useState('')
  const [receivedAmount, setReceivedAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [scenePhotos, setScenePhotos] = useState<string[]>([])

  const handleSave = () => {
    if (activePolicies.length === 0) {
      Taro.showToast({ title: '没有可用的保单', icon: 'none' })
      return
    }
    if (!assetName.trim()) {
      Taro.showToast({ title: '请输入资产名称', icon: 'none' })
      return
    }
    if (!lossDescription.trim()) {
      Taro.showToast({ title: '请输入损失说明', icon: 'none' })
      return
    }
    if (!claimAmount || Number(claimAmount) <= 0) {
      Taro.showToast({ title: '请输入有效理赔金额', icon: 'none' })
      return
    }

    const selectedPolicy = activePolicies[policyIdx]
    const newClaim = {
      id: `c${Date.now()}`,
      policyId: selectedPolicy.id,
      policyNo: selectedPolicy.policyNo,
      assetName: assetName.trim(),
      reportTime: reportTime,
      lossDescription: lossDescription.trim(),
      scenePhotos: scenePhotos,
      claimAmount: Number(claimAmount),
      receivedAmount: Number(receivedAmount) || 0,
      status: STATUS_MAP[statusIdx],
      remark: remark.trim(),
    }

    addClaim(newClaim)
    Taro.showToast({ title: '理赔已登记', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <View className={styles.container}>
      <View className={styles.form}>
        <View className={styles.formGroup}>
          <Text className={styles.label}>关联保单 *</Text>
          {activePolicies.length > 0 ? (
            <Picker
              mode="selector"
              range={activePolicies.map((p) => `${p.policyNo} - ${p.companyName}`)}
              value={policyIdx}
              onChange={(e) => setPolicyIdx(Number(e.detail.value))}
            >
              <View className={styles.pickerValue}>
                <Text>{activePolicies[policyIdx]?.policyNo} - {activePolicies[policyIdx]?.companyName}</Text>
              </View>
            </Picker>
          ) : (
            <View className={styles.pickerValue}>
              <Text style={{ color: '#A0AEC0' }}>暂无可用保单</Text>
            </View>
          )}
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>受损资产名称 *</Text>
          <Input
            className={styles.input}
            placeholder="请输入资产名称"
            value={assetName}
            onInput={(e) => setAssetName(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>损失说明 *</Text>
          <Input
            className={styles.input}
            placeholder="请描述损失情况"
            value={lossDescription}
            onInput={(e) => setLossDescription(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>报案时间</Text>
          <Input
            className={styles.input}
            placeholder="如 2025-01-01 10:00"
            value={reportTime}
            onInput={(e) => setReportTime(e.detail.value)}
          />
        </View>
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
          <Text className={styles.label}>理赔金额 (元) *</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入理赔金额"
            value={claimAmount}
            onInput={(e) => setClaimAmount(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>到账金额 (元)</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="如有到账请输入"
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
        <View className={styles.formGroup}>
          <Text className={styles.label}>现场照片</Text>
          <View className={styles.photoGrid}>
            {scenePhotos.map((src, idx) => (
              <View key={idx} className={styles.photoItem}>
                <Image
                  className={styles.photoImg}
                  src={src}
                  mode="aspectFill"
                  onClick={() =>
                    Taro.previewImage({
                      current: src,
                      urls: scenePhotos,
                    })
                  }
                />
                <View
                  className={styles.photoRemove}
                  onClick={(e) => {
                    e.stopPropagation()
                    setScenePhotos((prev) => prev.filter((_, i) => i !== idx))
                  }}
                >
                  <Text className={styles.photoRemoveText}>×</Text>
                </View>
              </View>
            ))}
            {scenePhotos.length < 9 && (
              <View
                className={styles.photoAdd}
                onClick={() => {
                  Taro.chooseImage({
                    count: 9 - scenePhotos.length,
                    success: (res) => {
                      setScenePhotos((prev) => [...prev, ...res.tempFilePaths])
                    },
                  })
                }}
              >
                <Text className={styles.photoAddIcon}>+</Text>
                <Text className={styles.photoAddText}>添加照片</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>提交理赔登记</Text>
        </View>
      </View>
    </View>
  )
}

export default ClaimAddPage
