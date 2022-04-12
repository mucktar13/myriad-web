import {useState} from 'react';
import {useSelector} from 'react-redux';

import {BN, BN_ONE, BN_TWO, BN_TEN} from '@polkadot/util';

import {Currency, CurrencyId} from 'src/interfaces/currency';
import {UserWallet} from 'src/interfaces/user';
import {WalletProvider} from 'src/lib/wallets';
import {RootState} from 'src/reducers';
import {UserState} from 'src/reducers/user/reducer';

export const useWallet = (wallet: UserWallet) => {
  const provider = WalletProvider(wallet.type, 'NEAR NETWORK ID');

  const {currencies} = useSelector<RootState, UserState>(state => state.userState);
  const [balances, setBalances] = useState<Partial<Record<CurrencyId, BN | string>>>();

  const loadBalances = async () => {
    const currency = currencies.find(currency => currency.networkId === wallet.network);

    if (!currency) return;

    provider.subscribe((currency, amount) => {
      console.log('AMOUNT CHANGED', currency, amount.toString());
    });

    const balance = await provider.getBalance(currency, wallet.id);

    setBalances(prevBalances => ({...prevBalances, [currency.symbol]: balance}));
  };

  const estimateFee = async (currency: Currency, from: string, to: string): Promise<BN | null> => {
    const fee = await provider.estimateFee(currency, from, to);

    if (fee) {
      return BN_ONE;
    } else {
      return BN_ONE.mul(BN_TEN.pow(new BN(currency.decimal))).div(BN_TEN.pow(BN_TWO));
    }
  };

  const sendTip = async (): Promise<BN | null> => {
    return null;
  };

  return {
    balances,
    loadBalances,
    estimateFee,
    sendTip,
  };
};
