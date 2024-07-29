import { BN } from '@polkadot/util';

import { BalanceDetail } from 'src/interfaces/balance';
import { Comment } from 'src/interfaces/comment';
import { Currency } from 'src/interfaces/currency';
import { ReferenceType } from 'src/interfaces/interaction';
import { NetworkIdEnum } from 'src/interfaces/network';
import { People } from 'src/interfaces/people';
import { Post } from 'src/interfaces/post';
import { User } from 'src/interfaces/user';
import { WalletDetail, WalletTypeEnum } from 'src/interfaces/wallet';

export interface UserWithWalletDetail extends User {
  walletDetail?: WalletDetail;
}

export interface PeopleWithWalletDetail extends People {
  walletDetail?: WalletDetail;
}

export type TippingOptions = {
  receiver: UserWithWalletDetail | PeopleWithWalletDetail;
  reference: Post | Comment | User | ExclusiveContentWithPrices;
  referenceType: ReferenceType;
  referenceId?: string;
};
export interface TippingProviderProps {
  anonymous: boolean;
  sender?: User;
  currentWallet?: WalletTypeEnum;
  currentNetwork?: NetworkIdEnum;
}

export type SendTipProps = {
  sender: User;
  receiver: UserWithWalletDetail | PeopleWithWalletDetail;
  reference: Post | Comment | User | ExclusiveContentWithPrices;
  referenceType: ReferenceType;
  defaultCurrency: BalanceDetail;
  balances: BalanceDetail[];
  currentNetwork: NetworkIdEnum;
  onSuccess: (
    currency: BalanceDetail,
    explorerURL: string,
    transactionHash: string,
    amount: BN,
  ) => Promise<void> | void;
  referenceId?: string;
};

export interface ExclusiveContent {
  content?: {
    text: string;
    rawText: string;
  };
  id: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExclusiveContentPrice {
  id: string;
  amount: number;
  currencyId: string;
  unlockableContentId: string;
  currency: Currency;
}

export type ExclusiveContentWithPrices = ExclusiveContent & {
  user?: User;
  prices?: ExclusiveContentPrice[];
};
