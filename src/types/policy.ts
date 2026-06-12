export type PolicyStatus = 'active' | 'expiring' | 'expired' | 'pending'

export interface Policy {
  id: string
  policyNo: string
  companyName: string
  premium: number
  insuredAmount: number
  startDate: string
  endDate: string
  status: PolicyStatus
  assetIds: string[]
  contractPhotos: string[]
  category: string
  remark: string
  isKey: boolean
}
