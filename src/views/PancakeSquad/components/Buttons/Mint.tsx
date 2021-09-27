/* eslint-disable react-hooks/exhaustive-deps */
import { BigNumber } from '@ethersproject/bignumber'
import React, { useEffect, useState } from 'react'
import { AutoRenewIcon, Button, useModal } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
import { useCallWithGasPrice } from 'hooks/useCallWithGasPrice'
import { useNftSaleContract } from 'hooks/useContract'
import useToast from 'hooks/useToast'
import { DefaultTheme } from 'styled-components'
import { SaleStatusEnum } from '../../types'
import ConfirmModal from '../Modals/Confirm'

type PreEventProps = {
  t: ContextApi['t']
  theme: DefaultTheme
  saleStatus: SaleStatusEnum
  numberTicketsOfUser: number
  numberTokensOfUser: number
  ticketsOfUser: BigNumber[]
}

const MintButton: React.FC<PreEventProps> = ({ t, theme, saleStatus, numberTicketsOfUser, ticketsOfUser }) => {
  const { callWithGasPrice } = useCallWithGasPrice()
  const nftSaleContract = useNftSaleContract()
  const [isLoading, setIsLoading] = useState(false)
  const [txHashMintingResult, setTxHashMintingResult] = useState(null)
  const { toastError } = useToast()
  const canMintTickets = saleStatus === SaleStatusEnum.Claim && numberTicketsOfUser > 0

  const [onPresentConfirmModal, onDismiss] = useModal(
    <ConfirmModal
      title={t('Mint')}
      isLoading={isLoading}
      headerBackground={theme.colors.gradients.cardHeader}
      txHash={txHashMintingResult}
      loadingText={t('Please enable BNB spending in your wallet')}
      loadingButtonLabel={t('Minting...')}
      successButtonLabel={t('Close')}
    />,
  )

  const mintTokenCallBack = async () => {
    setIsLoading(true)
    try {
      const tx = await callWithGasPrice(nftSaleContract, 'mint', [ticketsOfUser])
      const receipt = await tx.wait()
      if (receipt.status) {
        setTxHashMintingResult(receipt.transactionHash)
      }
    } catch (error) {
      onDismiss()
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => txHashMintingResult && onPresentConfirmModal(), [txHashMintingResult])

  return (
    <>
      {canMintTickets && (
        <Button
          width="100%"
          onClick={mintTokenCallBack}
          disabled={isLoading}
          endIcon={isLoading ? <AutoRenewIcon spin color="currentColor" /> : undefined}
        >
          {t('Mint NFTs (%tickets%)', { tickets: numberTicketsOfUser })}
        </Button>
      )}
    </>
  )
}

export default MintButton