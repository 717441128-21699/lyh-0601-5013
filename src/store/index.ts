import { create } from 'zustand'
import { Policy } from '@/types/policy'
import { Asset } from '@/types/asset'
import { Claim } from '@/types/claim'
import { mockPolicies } from '@/data/policy'
import { mockAssets } from '@/data/asset'
import { mockClaims } from '@/data/claim'

interface InsuranceStore {
  policies: Policy[]
  assets: Asset[]
  claims: Claim[]

  addPolicy: (policy: Policy) => void
  updatePolicy: (id: string, data: Partial<Policy>) => void

  addAsset: (asset: Asset) => void
  updateAsset: (id: string, data: Partial<Asset>) => void
  toggleAssetKey: (id: string) => void

  addClaim: (claim: Claim) => void
  updateClaim: (id: string, data: Partial<Claim>) => void
}

export const useInsuranceStore = create<InsuranceStore>((set) => ({
  policies: mockPolicies,
  assets: mockAssets,
  claims: mockClaims,

  addPolicy: (policy) =>
    set((state) => ({ policies: [...state.policies, policy] })),

  updatePolicy: (id, data) =>
    set((state) => ({
      policies: state.policies.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  addAsset: (asset) =>
    set((state) => ({ assets: [...state.assets, asset] })),

  updateAsset: (id, data) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  toggleAssetKey: (id) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, isKey: !a.isKey } : a)),
    })),

  addClaim: (claim) =>
    set((state) => ({ claims: [...state.claims, claim] })),

  updateClaim: (id, data) =>
    set((state) => ({
      claims: state.claims.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
}))
