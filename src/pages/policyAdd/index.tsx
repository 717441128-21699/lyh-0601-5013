import React, { useState, useEffect } from 'react'
import { View, Text, Input, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import dayjs from 'dayjs'
import { useInsuranceStore } from '@/store'
import { PolicyStatus } from '@/types/policy'
import styles from './index.module.scss'

const CATEGORIES = ['设备', '车辆', '贵重物品']
const CATEGORY_MAP: Record<string, string> = { '设备': 'equipment', '车辆': 'vehicle', '贵重物品': 'valuable' }

const PolicyAddPage: React.FC = () => {
  const router = useRouter()
  const { addPolicy, assets } = useInsuranceStore()
  const renewFrom = router.params.renewFrom

  const [policyNo, setPolicyNo] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [premium, setPremium] = useState('')
  const [insuredAmount, setInsuredAmount] = useState('')
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().add(1, 'year').format('YYYY-MM-DD'))
  const [categoryIdx, setCategoryIdx] = useState(0)
  const [remark, setRemark] = useState('')
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([])

  useEffect(() => {
    if (renewFrom) {
      const p = router.params
      if (p.policyNo) setPolicyNo(decodeURIComponent(p.policyNo))
      if (p.companyName) setCompanyName(decodeURIComponent(p.companyName))
      if (p.premium) setPremium(p.premium)
      if (p.insuredAmount) setInsuredAmount(p.insuredAmount)
      if (p.category) {
        const idx = CATEGORIES.findIndex((_, i) => CATEGORY_MAP[CATEGORIES[i]] === p.category)
        if (idx >= 0) setCategoryIdx(idx)
      }
    }
  }, [renewFrom])

  const computeStatus = (start: string, end: string): PolicyStatus => {
    const now = dayjs()
    if (now.isBefore(dayjs(start))) return 'pending'
    const diff = dayjs(end).diff(now, 'day')
    if (diff < 0) return 'expired'
    if (diff <= 30) return 'expiring'
    return 'active'
  }

  const uninsuredAssets = assets.filter((a) => !a.isInsured)

  const toggleAsset = (assetId: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    )
  }

  const handleSave = () => {
    if (!policyNo.trim()) {
      Taro.showToast({ title: '请输入保单号', icon: 'none' })
      return
    }
    if (!companyName.trim()) {
      Taro.showToast({ title: '请输入保险公司', icon: 'none' })
      return
    }
    if (!premium || Number(premium) <= 0) {
      Taro.showToast({ title: '请输入有效保费', icon: 'none' })
      return
    }
    if (!insuredAmount || Number(insuredAmount) <= 0) {
      Taro.showToast({ title: '请输入有效保额', icon: 'none' })
      return
    }

    const newPolicy = {
      id: `p${Date.now()}`,
      policyNo: policyNo.trim(),
      companyName: companyName.trim(),
      premium: Number(premium),
      insuredAmount: Number(insuredAmount),
      startDate,
      endDate,
      status: computeStatus(startDate, endDate),
      assetIds: selectedAssetIds,
      contractPhotos: [] as string[],
      category: CATEGORY_MAP[CATEGORIES[categoryIdx]],
      remark: remark.trim(),
      isKey: false,
    }

    addPolicy(newPolicy)

    selectedAssetIds.forEach((assetId) => {
      const { bindPolicyToAsset } = useInsuranceStore.getState()
      bindPolicyToAsset(assetId, newPolicy.id)
    })

    Taro.showToast({ title: '保单已保存', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <View className={styles.container}>
      <View className={styles.form}>
        <View className={styles.formGroup}>
          <Text className={styles.label}>保单号 *</Text>
          <Input
            className={styles.input}
            placeholder="请输入保单号"
            value={policyNo}
            onInput={(e) => setPolicyNo(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>保险公司 *</Text>
          <Input
            className={styles.input}
            placeholder="请输入保险公司名称"
            value={companyName}
            onInput={(e) => setCompanyName(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>资产类别</Text>
          <Picker
            mode="selector"
            range={CATEGORIES}
            value={categoryIdx}
            onChange={(e) => setCategoryIdx(Number(e.detail.value))}
          >
            <View className={styles.pickerValue}>
              <Text>{CATEGORIES[categoryIdx]}</Text>
            </View>
          </Picker>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>保费 (元) *</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入保费金额"
            value={premium}
            onInput={(e) => setPremium(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>保额 (元) *</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入保额金额"
            value={insuredAmount}
            onInput={(e) => setInsuredAmount(e.detail.value)}
          />
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>保障期限</Text>
          <View className={styles.dateRow}>
            <Picker mode="date" value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
              <View className={styles.dateBtn}>
                <Text>{startDate}</Text>
              </View>
            </Picker>
            <Text className={styles.dateSep}>至</Text>
            <Picker mode="date" value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
              <View className={styles.dateBtn}>
                <Text>{endDate}</Text>
              </View>
            </Picker>
          </View>
        </View>
        <View className={styles.formGroup}>
          <Text className={styles.label}>备注</Text>
          <Input
            className={styles.input}
            placeholder="请输入备注信息"
            value={remark}
            onInput={(e) => setRemark(e.detail.value)}
          />
        </View>

        {uninsuredAssets.length > 0 && (
          <View className={styles.formGroup}>
            <Text className={styles.label}>关联资产（未投保）</Text>
            <View className={styles.assetList}>
              {uninsuredAssets.map((asset) => (
                <View
                  key={asset.id}
                  className={`${styles.assetItem} ${selectedAssetIds.includes(asset.id) ? styles.assetItemSelected : ''}`}
                  onClick={() => toggleAsset(asset.id)}
                >
                  <Text className={styles.assetName}>{asset.name}</Text>
                  {selectedAssetIds.includes(asset.id) && <Text className={styles.assetCheck}>✓</Text>}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>保存保单</Text>
        </View>
      </View>
    </View>
  )
}

export default PolicyAddPage
