import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';

import { signIn, signOut, SignOutResponse } from 'next-auth/react';
import getConfig from 'next/config';

import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import useBlockchain from 'components/common/Blockchain/use-blockchain.hook';
import { usePolkadotExtension } from 'src/hooks/use-polkadot-app.hook';
import { MYRIAD_WALLET_KEY } from 'src/interfaces/blockchain-interface';
import { NetworkIdEnum } from 'src/interfaces/network';
import { BlockchainPlatform, WalletTypeEnum } from 'src/interfaces/wallet';
import * as AuthAPI from 'src/lib/api/ext-auth';
import * as WalletAPI from 'src/lib/api/wallet';
import { toHexPublicKey } from 'src/lib/crypto';
import * as FirebaseMessaging from 'src/lib/firebase/messaging';
import { Near } from 'src/lib/services/near-api-js';
import { PolkadotJs } from 'src/lib/services/polkadot-js';
import { RootState } from 'src/reducers';
import { UserState } from 'src/reducers/user/reducer';

type UserNonceProps = {
  nonce: number;
};

type UseAuthHooksArgs = {
  redirect?: string | string[];
};

export const useAuthHook = ({ redirect }: UseAuthHooksArgs = {}) => {
  const { anonymous: anonymousUser, networks } = useSelector<
    RootState,
    UserState
  >(state => state.userState);
  const { getPolkadotAccounts } = usePolkadotExtension();
  const { publicRuntimeConfig } = getConfig();
  const { provider } = useBlockchain();

  const [cookies] = useCookies([COOKIE_INSTANCE_URL]);

  const fetchUserNonce = async (
    address: string,
    apiURL?: string,
  ): Promise<UserNonceProps> => {
    try {
      const data = await WalletAPI.getUserNonce(address, apiURL);

      return data;
    } catch (error) {
      console.error('[useAuthHook][getUserNonce][error]', { error });
      return { nonce: 0 };
    }
  };

  const getRegisteredAccounts = async (): Promise<
    InjectedAccountWithMeta[]
  > => {
    const accounts = await getPolkadotAccounts();

    // TODO: UserAPI.getUserByAddress not working properly, uncomment this after api fixed
    // const users = await getUserByAccounts(accounts);

    // return accounts.filter(account => {
    //   return map(users, 'id').includes(toHexPublicKey(account));
    // });

    return accounts;
  };

  const signInWithExternalAuth = async (
    networkId: NetworkIdEnum,
    nonce: number,
    account?: InjectedAccountWithMeta,
    nearAddress?: string,
    walletType?: WalletTypeEnum,
  ) => {
    const blockchainPlatform =
      networkId === NetworkIdEnum.NEAR
        ? BlockchainPlatform.NEAR
        : BlockchainPlatform.SUBSTRATE;

    if (account) {
      const signature = await PolkadotJs.signWithWallet(account, nonce);

      if (!signature) return false;

      signIn('credentials', {
        address: toHexPublicKey(account),
        publicAddress: toHexPublicKey(account),
        signature,
        walletType: WalletTypeEnum.POLKADOT,
        networkType: networkId,
        nonce,
        instanceURL: cookies[COOKIE_INSTANCE_URL],
        blockchainPlatform,
        callbackUrl: redirect || publicRuntimeConfig.appAuthURL,
      });

      window.localStorage.setItem(MYRIAD_WALLET_KEY, walletType);

      return true;
    }

    if (nearAddress && nearAddress.length > 0) {
      const nearAccount = nearAddress.split('/')[1];
      const network = networks.find(
        network => network.id === NetworkIdEnum.NEAR,
      );

      if (!network) return false;

      const near = await Near.connect(network, walletType);
      const wallet = near.provider.wallet;
      const data = await Near.signWithWallet(
        wallet,
        undefined,
        { nonce },
        'sign in with external auth',
      );

      if (data && !data.signature) return false;

      if (data) {
        signIn('credentials', {
          address: nearAccount,
          publicAddress: data.publicAddress,
          signature: data.signature,
          walletType: WalletTypeEnum.NEAR,
          networkType: NetworkIdEnum.NEAR,
          nonce,
          instanceURL: cookies[COOKIE_INSTANCE_URL],
          blockchainPlatform,
          callbackUrl: publicRuntimeConfig.appAuthURL,
        });

        window.localStorage.setItem(MYRIAD_WALLET_KEY, walletType);

        return true;
      }
    }

    return false;
  };

  const signUpWithExternalAuth = async (
    id: string,
    name: string,
    username: string,
    networkId: NetworkIdEnum,
    account?: InjectedAccountWithMeta,
    walletType?: WalletTypeEnum,
  ): Promise<boolean> => {
    let nonce = null;

    const [address, nearAddress] = id.split('/');
    const data = await AuthAPI.signUp({
      address: nearAddress ?? address,
      name,
      username,
      network: networkId,
    });

    if (data) nonce = data.nonce;
    if (!nonce) return false;
    return signInWithExternalAuth(networkId, nonce, account, id, walletType);
  };

  const clearNearCache = async (): Promise<void> => {
    const nearNetwork = networks.find(
      network => network.id === NetworkIdEnum.NEAR,
    );

    if (nearNetwork) {
      const near = await Near.connect(nearNetwork);
      return near?.disconnect();
    }
  };

  const logout = async (path = '') => {
    window.localStorage.removeItem(MYRIAD_WALLET_KEY);
    window.localStorage.removeItem('email');

    const promises: Promise<SignOutResponse | void>[] = [
      signOut({
        callbackUrl: `${publicRuntimeConfig.appAuthURL}/${path}`,
        redirect: true,
      }),
    ];

    if (!anonymousUser) {
      promises.unshift(
        FirebaseMessaging.unregister(),
        clearNearCache(),
        provider?.disconnect(),
      );
    }

    await Promise.all(promises);
  };

  return {
    logout,
    clearNearCache,
    getRegisteredAccounts,
    fetchUserNonce,
    signInWithExternalAuth,
    signUpWithExternalAuth,
  };
};
