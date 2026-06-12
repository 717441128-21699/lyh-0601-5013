import { create } from 'zustand'
import { Policy } from '@/types/policy'
import { Asset } from '@/types/asset'
import { Claim } from '@/types/claim'
import { mockPolicies } from '@/data/policy'
import { mockAssets } from '@/data/asset'
import { mockClaims } from '@/data/claim'

const STORAGE_KEY = 'insurance_store'

function loadFromStorage(): { policies: Policy[]; assets: Asset[]; claims: Claim[] } | null {
  try {
    const raw = Taro?.getStorageSync?.(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('[Store] Load from storage failed:', e)
  }
  return null
}

function saveToStorage(data: { policies: Policy[]; assets: Asset[]; claims: Claim[] }) {
  try {
    Taro?.setStorageSync?.(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[Store] Save to storage failed:', e)
  }
}

import Taro from '@tarojs/taro'

const saved = loadFromStorage()
const initialPolicies = saved?.policies || mockPolicies
const initialAssets = saved?.assets || mockAssets
const initialClaims = saved?.claims || mockClaims

interface InsuranceStore {
  policies: Policy[]
  assets: Asset[]
  claims: Claim[]

  addPolicy: (policy: Policy) => void
  updatePolicy: (id: string, data: Partial<Policy>) => void
  deletePolicy: (id: string) => void

  addAsset: (asset: Asset) => void
  updateAsset: (id: string, data: Partial<Asset>) => void
  toggleAssetKey: (id: string) => void
  bindPolicyToAsset: (assetId: string, policyId: string) => void
  unbindPolicyFromAsset: (assetId: string) => void

  addClaim: (claim: Claim) => void
  updateClaim: (id: string, data: Partial<Claim>) => void
}

export const useInsuranceStore = create<InsuranceStore>((set, get) => ({
  policies: initialPolicies,
  assets: initialAssets,
  claims: initialClaims,

  addPolicy: (policy) =>
    set((state) => {
      const next = { policies: [...state.policies, policy], assets: state.assets, claims: state.claims }
      saveToStorage(next)
      return next
    }),

  updatePolicy: (id, data) =>
    set((state) => {
      const next = {
        policies: state.policies.map((p) => (p.id === id ? { ...p, ...data } : p)),
        assets: state.assets,
        claims: state.claims,
      }
      saveToStorage(next)
      return next
    }),

  deletePolicy: (id) =>
    set((state) => {
      const next = {
        policies: state.policies.filter((p) => p.id !== id),
        assets: state.assets.map((a) => (a.policyId === id ? { ...a, policyId: '', isInsured: false } : a)),
        claims: state.claims,
      }
      saveToStorage(next)
      return next
    }),

  addAsset: (asset) =>
    set((state) => {
      const next = { policies: state.policies, assets: [...state.assets, asset], claims: state.claims }
      saveToStorage(next)
      return next
    }),

  updateAsset: (id, data) =>
    set((state) => {
      const next = {
        policies: state.policies,
        assets: state.assets.map((a) => (a.id === id ? { ...a, ...data } : a)),
        claims: state.claims,
      }
      saveToStorage(next)
      return next
    }),

  toggleAssetKey: (id) =>
    set((state) => {
      const next = {
        policies: state.policies,
        assets: state.assets.map((a) => (a.id === id ? { ...a, isKey: !a.isKey } : a)),
        claims: state.claims,
      }
      saveToStorage(next)
      return next
    }),

  bindPolicyToAsset: (assetId, policyId) =>
    set((state) => {
      const updatedAssets = state.assets.map((a) =>
        a.id === assetId ? { ...a, policyId, isInsured: true } : a
      )
      const updatedPolicies = state.policies.map((p) =>
        p.id === policyId && !p.assetIds.includes(assetId)
          ? { ...p, assetIds: [...p.assetIds, assetId] }
          : p
      )
      const next = { policies: updatedPolicies, assets: updatedAssets, claims: state.claims }
      saveToStorage(next)
      return next
    }),

  unbindPolicyFromAsset: (assetId) =>
    set((state) => {
      const asset = state.assets.find((a) => a.id === assetId)
      const updatedAssets = state.assets.map((a) =>
        a.id === assetId ? { ...a, policyId: '', isInsured: false } : a
      )
      const updatedPolicies = asset
        ? state.policies.map((p) =>
            p.id === asset.policyId
              ? { ...p, assetIds: p.assetIds.filter((id) => id !== assetId) }
              : p
          )
        : state.policies
      const next = { policies: updatedPolicies, assets: updatedAssets, claims: state.claims }
      saveToStorage(next)
      return next
    }),

  addClaim: (claim) =>
    set((state) => {
      const next = { policies: state.policies, assets: state.assets, claims: [...state.claims, claim] }
      saveToStorage(next)
      return next
    }),

  updateClaim: (id, data) =>
    set((state) => {
      const next = {
        policies: state.policies,
        assets: state.assets,
        claims: state.claims.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }
      saveToStorage(next)
      return next
    }),
}))
