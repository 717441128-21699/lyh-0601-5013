export type AssetCategory = 'equipment' | 'vehicle' | 'valuable'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  model: string
  purchaseDate: string
  purchasePrice: number
  location: string
  policyId: string
  isKey: boolean
  isInsured: boolean
  thumbnail: string
}
