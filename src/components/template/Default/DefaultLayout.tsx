import React, { useState, useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux';

import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { Container } from '@material-ui/core';

import useStyles from './DefaultLayout.styles';

import { MenuRightContainer } from 'components/Menu/MenuRight.container';
import { BottombarComponent } from 'components/Mobile/Bottombar/Bottombar';
import TrendingTab from 'components/RightMenuBar/tabs/TrendingTab';
import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import { withError, WithErrorProps } from 'src/components/Error';
import { MenuContainer } from 'src/components/Menu';
import { NotificationsContainer } from 'src/components/Notifications';
import PwaWrapper from 'src/components/PwaWrapper';
import { RightMenuBar } from 'src/components/RightMenuBar/RightMenuBar';
import {
  CookieConsent,
  COOKIE_CONSENT_NAME,
} from 'src/components/common/CookieConsent';
import { TippingProvider } from 'src/components/common/Tipping/Tipping.provider';
import ShowIf from 'src/components/common/show-if.component';
import { useInstances } from 'src/hooks/use-instances.hooks';
import { useUserHook } from 'src/hooks/use-user.hook';
import {
  IProvider,
  MYRIAD_WALLET_KEY,
} from 'src/interfaces/blockchain-interface';
import { NotificationProps } from 'src/interfaces/notification';
import { BlockchainPlatform, WalletTypeEnum } from 'src/interfaces/wallet';
import * as FirebaseAnalytic from 'src/lib/firebase/analytic';
import * as FirebaseMessaging from 'src/lib/firebase/messaging';
import { BlockchainProvider } from 'src/lib/services/blockchain-provider';
import { clearBalances, loadBalances } from 'src/reducers/balance/actions';
import {
  countNewNotification,
  processNotification,
} from 'src/reducers/notification/actions';
import { fetchUserWalletAddress } from 'src/reducers/user/actions';

const WalletBalancesContainer = dynamic(
  () => import('../../WalletBalance/WalletBalanceContainer'),
  {
    ssr: false,
  },
);

const ProfileCardContainer = dynamic(
  () => import('src/components/ProfileCard/ProfileCard.container'),
  {
    ssr: false,
  },
);

const SocialMediaListContainer = dynamic(
  () => import('src/components/SocialMediaList/SocialMediaList.container'),
  {
    ssr: false,
  },
);

const BlockchainProviderComponent = dynamic(
  () => import('components/common/Blockchain/Blockchain.provider'),
  {
    ssr: false,
  },
);

type DefaultLayoutProps = WithErrorProps & {
  isOnProfilePage: boolean;
  children: React.ReactNode;
  session: Session;
};

const Default: React.FC<DefaultLayoutProps> = props => {
  const { children } = props;

  const classes = useStyles();
  const dispatch = useDispatch();
  const router = useRouter();

  const [cookies] = useCookies([COOKIE_CONSENT_NAME, COOKIE_INSTANCE_URL]);

  const { user, anonymous, currentWallet, updateUserFcmToken } = useUserHook();
  const { instance } = useInstances();
  const { data: session } = useSession();

  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [provider, setProvider] = useState<IProvider>(null);
  const [initialize, setInitialize] = useState<boolean>(true);

  const loadingNear = router.query.loading as string | null;

  const initializeProvider = useCallback(async () => {
    if (anonymous) return;
    if (!initialize) return;
    if (!currentWallet) return;
    if (loadingNear) dispatch(clearBalances());
    dispatch(clearBalances());

    const walletType = window.localStorage.getItem(MYRIAD_WALLET_KEY);
    const blockchain = await BlockchainProvider.connect(
      currentWallet.network,
      walletType as WalletTypeEnum,
    );
    const provider = blockchain?.provider;

    if (provider) provider.accountId = currentWallet.id;

    setProvider(provider);
    dispatch(loadBalances(provider, true));
    dispatch(fetchUserWalletAddress(provider, currentWallet.id));
    setInitialize(false);
    /* eslint-disable react-hooks/exhaustive-deps*/
  }, [anonymous, initialize, currentWallet, loadingNear]);

  useEffect(() => {
    initializeProvider();
  }, [initializeProvider]);

  useEffect(() => {
    if (user) {
      initializeFirebase();
    }
  }, [user]);

  useEffect(() => {
    const sessionInstanceURL = session?.user?.instanceURL;
    const cookiesInstanceURL = cookies[COOKIE_INSTANCE_URL];
    const rpc = sessionInstanceURL ?? cookiesInstanceURL ?? '';

    const query = router.query;

    if (query?.instance?.toString() === rpc) return;

    Object.assign(query, { instance: rpc });

    router.replace({ pathname: router.pathname, query }, undefined, {
      shallow: true,
    });
  }, [cookies[COOKIE_INSTANCE_URL], router.query.instance]);

  const processMessages = (payload?: NotificationProps) => {
    dispatch(countNewNotification());

    if (payload) {
      dispatch(processNotification(payload));
    }
  };

  const initializeFirebase = async () => {
    const token = await FirebaseMessaging.init(processMessages);

    if (token && !user?.deletedAt) {
      await updateUserFcmToken(token);
    }

    if (cookies[COOKIE_CONSENT_NAME]) {
      await FirebaseAnalytic.init();
    }
  };

  const handleToggleNotification = () => {
    setShowNotification(!showNotification);
  };

  const onInitializeBlockchain = async () => {
    setInitialize(true);
    if (provider?.constructor.name === 'PolkadotJs')
      await provider.disconnect();
    setProvider(null);
  };

  const getWallet = (blockchainPlatform?: BlockchainPlatform) => {
    switch (blockchainPlatform) {
      case BlockchainPlatform.SUBSTRATE:
        return WalletTypeEnum.POLKADOT;

      case BlockchainPlatform.NEAR:
        return WalletTypeEnum.NEAR;

      default:
        return;
    }
  };

  return (
    <BlockchainProviderComponent
      server={instance}
      provider={provider}
      currentWallet={currentWallet}
      onChangeProvider={onInitializeBlockchain}
      loadingBlockchain={initialize}>
      <TippingProvider
        anonymous={anonymous}
        sender={user}
        currentWallet={getWallet(currentWallet?.network?.blockchainPlatform)}
        currentNetwork={currentWallet?.networkId}>
        <Container maxWidth="lg" disableGutters>
          <div className={classes.root}>
            <div className={classes.firstCol}>
              <div className={classes.innerFirstColWrapper}>
                <div>
                  <MenuContainer
                    logo={instance?.images?.logo_banner ?? ''}
                    anonymous={anonymous}
                  />
                </div>
                <div>
                  <RightMenuBar anonymous={anonymous} />
                </div>
              </div>
            </div>

            <div className={classes.secondCol}>
              <div className={classes.innerSecondColWrapper}>{children}</div>
            </div>

            <div className={classes.thirdCol}>
              <div className={classes.innerThirdColWrapper}>
                <ProfileCardContainer
                  toggleNotification={handleToggleNotification}
                />

                <ShowIf condition={!showNotification}>
                  <div className={classes.rightCard}>
                    <MenuRightContainer
                      logo={instance?.images?.logo_banner ?? ''}
                      anonymous={anonymous}
                    />
                  </div>
                  <div className={classes.rightCard}>
                    <SocialMediaListContainer />
                  </div>
                  <div className={classes.rightCard}>
                    <WalletBalancesContainer />
                  </div>
                  <div className={classes.rightCard}>
                    <TrendingTab />
                  </div>
                </ShowIf>

                <ShowIf condition={showNotification}>
                  <NotificationsContainer infinite={false} size="small" />
                </ShowIf>
              </div>
            </div>
            <BottombarComponent />
          </div>
        </Container>

        <PwaWrapper />
        <CookieConsent />
      </TippingProvider>
    </BlockchainProviderComponent>
  );
};

export const DefaultLayout = withError(Default);
