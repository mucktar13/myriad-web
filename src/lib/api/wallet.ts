import { isHex } from '@polkadot/util';

import MyriadAPI from './base';
import { AccountRegisteredError } from './errors/account-registered.error';
import { BaseList } from './interfaces/base-list.interface';
import { BaseErrorResponse } from './interfaces/error-response.interface';

import axios, { AxiosError } from 'axios';
import { Network } from 'src/interfaces/network';
import { User, UserWallet, Wallet } from 'src/interfaces/user';

type WalletList = BaseList<UserWallet>;
type Networks = BaseList<Network>;

type UserNonceProps = {
  nonce: number;
};

export type ConnectNetwork = {
  publicAddress: string;
  nonce: number;
  signature: string | null;
  networkType: string;
  walletType: string;
  data?: {
    id: string;
  };
};

export const getUserNonce = async (
  id: string,
  apiURL?: string,
): Promise<UserNonceProps> => {
  const address = isHex(`0x${id}`) ? `0x${id}` : id;

  if (apiURL) {
    const { data } = await axios({
      url: `${apiURL}/authentication/nonce?id=${address}&type=wallet`,
      method: 'GET',
    });

    return data ? data : { nonce: 0 };
  }

  const { data } = await MyriadAPI().request({
    url: `/authentication/nonce?id=${address}&type=wallet`,
    method: 'GET',
  });

  return data ? data : { nonce: 0 };
};

export const getUser = async (): Promise<User | null> => {
  const params: Record<string, any> = {
    filter: {
      include: [
        {
          relation: 'wallets',
          scope: {
            include: [{ relation: 'network' }],
            where: {
              primary: true,
            },
          },
        },
      ],
    },
  };

  const { data } = await MyriadAPI().request<User>({
    url: `/user/me`,
    method: 'GET',
    params,
  });

  return data;
};

export const getCurrentUserWallet = async (): Promise<UserWallet> => {
  const { data } = await MyriadAPI().request({
    url: `/user/wallet`,
    method: 'GET',
  });

  return data;
};

export const getUserWallets = async (userId: string): Promise<WalletList> => {
  const { data } = await MyriadAPI().request({
    url: `/users/${userId}/wallets`,
    method: 'GET',
    params: {
      filter: {
        include: ['network'],
      },
    },
  });

  return data;
};

export const getUserNonceByUserId = async (
  id: string,
): Promise<UserNonceProps> => {
  const { data } = await MyriadAPI().request({
    url: `/authentication/nonce?id=${id}&type=user`,
    method: 'GET',
  });

  return data ? data : { nonce: 0 };
};

export const connectNetwork = async (
  payload: ConnectNetwork,
  id: string,
): Promise<Wallet | null> => {
  try {
    const { data } = await MyriadAPI().request<Wallet>({
      url: `/user/connect-wallet`,
      method: 'POST',
      data: payload,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error as AxiosError<BaseErrorResponse>;

      if (response.data.error.name === 'UnprocessableEntityError') {
        throw new AccountRegisteredError(response.data.error);
      }
    }

    return null;
  }
};

export const disconnectNetwork = async (
  payload: ConnectNetwork,
  walletId: string,
): Promise<Wallet | null> => {
  const address = isHex(`0x${walletId}`) ? `0x${walletId}` : walletId;
  const { data } = await MyriadAPI().request<Wallet>({
    url: `/user/wallets/${address}`,
    method: 'DELETE',
    data: payload,
  });

  return data;
};

export const switchNetwork = async (
  payload: ConnectNetwork,
  id: string,
): Promise<any> => {
  try {
    const data = await MyriadAPI().request({
      url: `/user/switch-network`,
      method: 'PATCH',
      data: payload,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error as AxiosError<BaseErrorResponse>;

      if (response.data.error.name === 'UnprocessableEntityError') {
        throw new AccountRegisteredError(response.data.error);
      }
    } else {
      throw error;
    }
  }
};

export const getNetworks = async (): Promise<Networks> => {
  const { data } = await MyriadAPI().request({
    url: `/networks`,
    method: 'GET',
    params: {
      pageLimit: 10,
      filter: {
        include: [
          {
            relation: 'currencies',
            scope: {
              order: 'priority ASC',
            },
          },
        ],
      },
    },
  });

  return data;
};

export const claimReference = async ({
  txFee,
  tippingContractId,
}: {
  txFee: string;
  tippingContractId?: string;
}) => {
  try {
    const { data } = await MyriadAPI().request({
      url: '/user/claim-references',
      method: 'POST',
      data: { txFee, tippingContractId },
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { response } = error as AxiosError<BaseErrorResponse>;

      if (response.data.error.name === 'UnprocessableEntityError') {
        throw new Error(response.data.error.message);
      }
    }

    return null;
  }
};

export const getTipStatus = async () => {
  const { data } = await MyriadAPI().request({
    url: `/user/tip-status`,
    method: 'GET',
  });
  return data;
};
