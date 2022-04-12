import {BN} from '@polkadot/util';

import {Currency} from 'src/interfaces/currency';

export interface WalletProviderInterface {
  subscribe(callback: BalanceCallback): void;
  createSignature(nonce: number, wallet: string): Promise<string>;
  estimateFee(currency: Currency, from: string, to: string): Promise<BN | string>;
  getBalance(currency: Currency, account: string): Promise<BN | string>;
  sendTransaction(currency: Currency, from: string, to: string, amount: BN): Promise<void>;
  getTips(payload: TipsBalanceInfo): Promise<TipResult | null>;
  claimTip(payload: TipsBalanceInfo): Promise<void>;
}

export type BalanceCallback = (currency: Currency, change: BN) => void;

export type TipsBalanceInfo = {
  serverId: string;
  referenceType: string;
  referenceId: string;
  ftIdentifier: string;
  wallet: string;
};

export interface TipResult {
  tipsBalanceInfo: TipsBalanceInfo;
  accountId: string;
  amount: string;
}
