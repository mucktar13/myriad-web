import { BaseModel } from './base.interface';
import { Currency } from './currency';
import { BlockchainPlatform } from './wallet';

import { TipsResult } from 'src/interfaces/blockchain-interface';

export enum NetworkIdEnum {
  ETHEREUM = 'ethereum',
  POLKADOT = 'polkadot',
  BINANCE = 'binance',
  POLYGON = 'polygon',
  NEAR = 'near',
  MYRIADOCTOPUS = 'myriad',
  MYRIADROCOCO = 'rococo',
  KUSAMA = 'kusama',
  DEBIO = 'debio',
}

export type NetworkProps = {
  chainId?: string;
  image: string;
  rpcURL: string;
  explorerURL: string;
  blockchainPlatform: BlockchainPlatform;
  walletURL?: string;
  additionalWalletURL?: string;
  helperURL?: string;
};

export type Network = NetworkProps &
  BaseModel & {
    id: NetworkIdEnum;
    currencies: Currency[];
    tips: TipsResult[];
  };
