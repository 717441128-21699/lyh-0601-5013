export type ClaimStatus = 'reported' | 'processing' | 'approved' | 'paid' | 'rejected'

export interface Claim {
  id: string
  policyId: string
  policyNo: string
  assetName: string
  reportTime: string
  lossDescription: string
  scenePhotos: string[]
  claimAmount: number
  receivedAmount: number
  status: ClaimStatus
  remark: string
}
