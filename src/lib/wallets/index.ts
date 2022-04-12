import getConfig from 'next/config';

import {NearWallet} from './near.wallet';
import {PolkadotWallet} from './polkadot.wallet';
import {WalletProviderInterface} from './wallet.interface';

import {WalletTypeEnum} from 'src/lib/api/ext-auth';

export const WalletProvider = (
  network: WalletTypeEnum,
  networkId?: string,
): WalletProviderInterface => {
  const {
    publicRuntimeConfig: {appName},
  } = getConfig();

  const providers: Record<WalletTypeEnum, WalletProviderInterface> = {
    [WalletTypeEnum.POLKADOT]: new PolkadotWallet(appName),
    [WalletTypeEnum.NEAR]: new NearWallet(appName, networkId ?? 'testnet'),
    // finish later
    [WalletTypeEnum.METAMASK]: new NearWallet(appName, networkId ?? 'testnet'),
    [WalletTypeEnum.TRUST]: new NearWallet(appName, networkId ?? 'testnet'),
    [WalletTypeEnum.COINBASE]: new NearWallet(appName, networkId ?? 'testnet'),
    [WalletTypeEnum.SENDER]: new NearWallet(appName, networkId ?? 'testnet'),
  };

  return providers[network];
};
