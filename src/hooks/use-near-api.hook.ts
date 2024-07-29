import { useSelector } from 'react-redux';

import { BN, BN_ZERO, BN_TEN } from '@polkadot/util';

import { formatBalance } from 'src/helpers/balance';
import {
  CallbackURL,
  SignatureProps,
  TipsResultsProps,
} from 'src/interfaces/blockchain-interface';
import { Network, NetworkIdEnum } from 'src/interfaces/network';
import { Wallet } from 'src/interfaces/user';
import { WalletTypeEnum } from 'src/interfaces/wallet';
import { Near } from 'src/lib/services/near-api-js';
import { RootState } from 'src/reducers';
import { UserState } from 'src/reducers/user/reducer';

type UserNetwork = {
  userId?: string;
  network?: Network;
};

export const useNearApi = () => {
  const { networks } = useSelector<RootState, UserState>(
    state => state.userState,
  );

  const connectToNear = async (
    callbackURL?: CallbackURL,
    userNetwork?: UserNetwork,
    walletType?: WalletTypeEnum,
    action?: string,
  ): Promise<SignatureProps | null> => {
    let network = userNetwork?.network;

    if (!network) {
      network = networks.find(network => network.id === NetworkIdEnum.NEAR);
    }

    if (!network) return;

    const successCallbackURL = callbackURL?.successCallbackURL;
    const failedCallbackURL = callbackURL?.failedCallbackURL;
    const near = await Near.connect(network, walletType);
    const wallet = near?.provider?.wallet;

    return Near.signWithWallet(
      wallet,
      { successCallbackURL, failedCallbackURL },
      { userId: userNetwork?.userId, walletType },
      action,
    );
  };

  const getClaimTipNear = async (
    serverId: string,
    referenceId: string,
    referenceIds: string[],
    wallet: Wallet,
    network: Network,
    verifyNearTips = false,
    nearBalance = '0.00',
  ): Promise<TipsResultsProps> => {
    const data = await Near.claimTipBalances(
      network.rpcURL,
      serverId,
      referenceId,
      referenceIds,
    );

    let nativeDecimal = 0;
    let accountIdExist = true;

    const tipsResults = data.map(e => {
      const currency = network.currencies.find(currency => {
        const ftIdentifier = e.tips_balance.tips_balance_info.ft_identifier;
        if (currency.native && ftIdentifier === 'native') return true;
        if (ftIdentifier === currency.referenceId) return true;
        return false;
      });

      const { tips_balance, symbol, unclaimed_reference_ids } = e;
      const { account_id, tips_balance_info } = tips_balance;
      const { server_id, reference_type, reference_id, ft_identifier } =
        tips_balance_info;

      let { formatted_amount } = e;
      let accountId = unclaimed_reference_ids.length === 0 ? account_id : null;

      if (verifyNearTips) {
        if (currency.native) formatted_amount = nearBalance;
        accountId = wallet?.id ?? null;
      }

      if (!accountId && wallet?.networkId === network.id) {
        if (currency.native) nativeDecimal = currency.decimal;
        if (parseFloat(formatted_amount) > 0) {
          const decimal = new BN(BN_TEN).pow(
            new BN(currency.decimal.toString()),
          );
          const amount = new BN(formatted_amount).mul(decimal);
          if (amount.gt(BN_ZERO)) accountIdExist = false;
        }
      }

      return {
        symbol,
        accountId,
        amount: parseFloat(formatted_amount).toFixed(3),
        tipsBalanceInfo: {
          serverId: server_id,
          referenceType: reference_type,
          referenceId: reference_id,
          ftIdentifier: ft_identifier,
        },
        imageURL: currency?.image,
      };
    });

    let feeInfo = null;

    if (network.id === wallet?.networkId && !accountIdExist) {
      const fee = await Near.claimReferenceFee(network.rpcURL);
      const finalTxFee = formatBalance(fee, nativeDecimal, 4);

      feeInfo = {
        formattedTrxFee: finalTxFee,
        trxFee: fee.toString(),
      };
    }

    return {
      tipsResults,
      feeInfo,
    };
  };

  return {
    connectToNear,
    getClaimTipNear,
  };
};
