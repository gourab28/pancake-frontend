import { DynamicSaleInfos, FixedSaleInfos, UserStatusEnum } from 'views/PancakeSquad/types'

export type PancakeSquadHeaderType = {
  account: string
  isLoading: boolean
  fixedSaleInfo?: FixedSaleInfos
  dynamicSaleInfo?: DynamicSaleInfos
  userStatus: UserStatusEnum
}

export enum ButtonsEnum {
  CONNECT,
  ACTIVATE,
  BUY,
  MINT,
  END,
  NONE,
}