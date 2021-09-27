/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Button, useModal } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
import { ethers } from 'ethers'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useCake, useNftSaleContract } from 'hooks/useContract'
import { DefaultTheme } from 'styled-components'
import { ethersToBigNumber } from 'utils/bigNumber'
import { SaleStatusEnum, UserStatusEnum } from '../../types'
import BuyTicketsModal from '../Modals/BuyTickets'
import ConfirmModal from '../Modals/Confirm'
import ReadyText from '../Header/ReadyText'
import getBuyButtonText from './utils'

type BuyTicketsProps = {
  t: ContextApi['t']
  account: string
  saleStatus: SaleStatusEnum
  userStatus: UserStatusEnum
  theme: DefaultTheme
  canClaimForGen0: boolean
  maxPerAddress: number
  maxPerTransaction: number
  numberTicketsOfUser: number
  numberTicketsForGen0: number
  numberTicketsUsedForGen0: number
  cakeBalance: BigNumber
  pricePerTicket: BigNumber
}

const BuyTicketsButtons: React.FC<BuyTicketsProps> = ({
  t,
  account,
  saleStatus,
  userStatus,
  theme,
  canClaimForGen0,
  maxPerAddress,
  maxPerTransaction,
  numberTicketsOfUser,
  numberTicketsForGen0,
  numberTicketsUsedForGen0,
  cakeBalance,
  pricePerTicket,
}) => {
  const [txHashEnablingResult, setTxHashEnablingResult] = useState(null)
  const [txHashBuyingResult, setTxHashBuyingResult] = useState(null)
  const { callWithGasPrice } = useCallWithGasPrice()
  const nftSaleContract = useNftSaleContract()
  const cakeContract = useCake()

  const isUserUnactiveProfile = userStatus === UserStatusEnum.NO_PROFILE || userStatus === UserStatusEnum.UNCONNECTED
  const canBuySaleTicket =
    saleStatus === SaleStatusEnum.Sale && numberTicketsOfUser - numberTicketsUsedForGen0 < maxPerAddress
  const isPreSale = saleStatus === SaleStatusEnum.Presale
  const isSale = saleStatus === SaleStatusEnum.Sale
  const isGen0User = UserStatusEnum.PROFILE_ACTIVE_GEN0
  const isUserReady =
    (userStatus === UserStatusEnum.PROFILE_ACTIVE && saleStatus < SaleStatusEnum.Sale) ||
    (userStatus === isGen0User && saleStatus === SaleStatusEnum.Pending)

  const { isApproving, isApproved, isConfirming, handleApprove, handleConfirm, hasApproveFailed, hasConfirmFailed } =
    useApproveConfirmTransaction({
      onRequiresApproval: async () => {
        try {
          const response = await cakeContract.allowance(account, nftSaleContract.address)
          const currentAllowance = ethersToBigNumber(response)
          return currentAllowance.gt(0)
        } catch (error) {
          return false
        }
      },
      onApprove: () => {
        return callWithGasPrice(cakeContract, 'approve', [nftSaleContract.address, ethers.constants.MaxUint256])
      },
      onApproveSuccess: async ({ receipt }) => {
        setTxHashEnablingResult(receipt.transactionHash)
      },
      onConfirm: ({ ticketsNumber }) => {
        onPresentConfirmModal()
        return callWithGasPrice(nftSaleContract, isPreSale ? 'buyTicketsInPreSaleForGen0' : 'buyTickets', [
          ticketsNumber,
        ])
      },
      onSuccess: async ({ receipt }) => {
        setTxHashBuyingResult(receipt.transactionHash)
      },
    })

  const [onPresentConfirmModal] = useModal(
    <ConfirmModal
      title={t('Confirm')}
      isLoading={isConfirming}
      headerBackground={theme.colors.gradients.cardHeader}
      txHash={txHashBuyingResult}
      loadingText={t('Please enable BNB spending in your wallet')}
      loadingButtonLabel={t('Confirming...')}
      successButtonLabel={t('Close')}
    />,
  )

  const [onPresentEnableModal, onDismissEnableModal] = useModal(
    <ConfirmModal
      title={t('Enable')}
      isLoading={isApproving}
      headerBackground={theme.colors.gradients.cardHeader}
      txHash={txHashEnablingResult}
      loadingText={t('Please enable CAKE spending in yout wallet')}
      loadingButtonLabel={t('Enabling...')}
      successButtonLabel={t('Close')}
    />,
  )

  const [onPresentBuyTicketsModal, onDismissBuyTicketsModal] = useModal(
    <BuyTicketsModal
      title={t('Buy Minting Tickets')}
      buyTicketCallBack={handleConfirm}
      headerBackground={theme.colors.gradients.cardHeader}
      cakeBalance={cakeBalance}
      maxPerAddress={maxPerAddress}
      maxPerTransaction={maxPerTransaction}
      numberTicketsForGen0={numberTicketsForGen0}
      numberTicketsOfUser={numberTicketsOfUser}
      numberTicketsUsedForGen0={numberTicketsUsedForGen0}
      pricePerTicket={pricePerTicket}
      saleStatus={saleStatus}
    />,
  )

  useEffect(() => txHashEnablingResult && onPresentEnableModal(), [txHashEnablingResult])
  useEffect(() => txHashBuyingResult && onPresentConfirmModal(), [txHashBuyingResult])
  useEffect(() => hasApproveFailed && onDismissEnableModal(), [hasApproveFailed])
  useEffect(() => hasConfirmFailed && onDismissBuyTicketsModal(), [hasConfirmFailed])

  const handleEnableClick = () => {
    onPresentEnableModal()
    handleApprove()
  }

  const canBuyTickets = (canClaimForGen0 || canBuySaleTicket) && isApproved

  return (
    <>
      {!isApproved && !isUserUnactiveProfile && (
        <Button width="100%" onClick={handleEnableClick}>
          {t('Enable')}
        </Button>
      )}
      {(isPreSale || isSale) && (
        <Button width="100%" onClick={onPresentBuyTicketsModal} disabled={!canBuyTickets}>
          {getBuyButtonText({ canBuyTickets, numberTicketsOfUser, saleStatus, t })}
        </Button>
      )}
      {isUserReady && isApproved && (
        <ReadyText text={t(isGen0User ? 'Ready for Pre-Sale!' : 'Ready for Public Sale!')} />
      )}
    </>
  )
}

export default BuyTicketsButtons