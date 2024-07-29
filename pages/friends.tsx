import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import getConfig from 'next/config';
import Head from 'next/head';

import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import { FriendMenuComponent } from 'src/components/FriendsMenu/FriendMenu';
import { TopNavbarComponent } from 'src/components/atoms/TopNavbar';
import { TippingSuccess } from 'src/components/common/Tipping/render/Tipping.success';
import { DefaultLayout } from 'src/components/template/Default/DefaultLayout';
import { UserMetric } from 'src/interfaces/user';
import { updateSession } from 'src/lib/api/auth-link';
import { initialize } from 'src/lib/api/base';
import { healthcheck } from 'src/lib/api/healthcheck';
import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import { fetchAvailableToken } from 'src/reducers/config/actions';
import { fetchExchangeRates } from 'src/reducers/exchange-rate/actions';
import { fetchFriend } from 'src/reducers/friend/actions';
import { countNewNotification } from 'src/reducers/notification/actions';
import { fetchServer } from 'src/reducers/server/actions';
import {
  fetchConnectedSocials,
  fetchUser,
  fetchUserExperience,
  fetchUserWallets,
  fetchNetwork,
} from 'src/reducers/user/actions';
import { wrapper } from 'src/store';
import { ThunkDispatchAction } from 'src/types/thunk';

const { publicRuntimeConfig } = getConfig();

type FriendsPageProps = {
  session: Session;
};

const Friends: React.FC<FriendsPageProps> = props => {
  const metric = useSelector<RootState, UserMetric | undefined>(
    state => state.userState.user?.metric,
  );
  const { session } = props;
  useEffect(() => {
    if (!session?.user?.instanceURL) updateSession(session);
  }, [session]);

  return (
    <DefaultLayout isOnProfilePage={false} {...props}>
      <Head>
        <title>
          {i18n.t('Friends.Title', { appname: publicRuntimeConfig.appName })}
        </title>
      </Head>
      <TopNavbarComponent
        description={i18n.t('TopNavbar.Subtitle.Friends', {
          total: metric?.totalFriends ?? 0,
        })}
        sectionTitle={i18n.t('TopNavbar.Title.Friends')}
        type={'menu'}
      />

      <FriendMenuComponent />
      <TippingSuccess />
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  store => async context => {
    const { query, req, res } = context;
    const { cookies } = req;

    const dispatch = store.dispatch as ThunkDispatchAction;

    let session: Session | null = null;

    try {
      session = await getSession(context);
    } catch {
      // ignore
    }

    if (!session?.user) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const queryInstanceURL = query.instance;
    const sessionInstanceURL = session?.user?.instanceURL;
    const cookiesInstanceURL = cookies[COOKIE_INSTANCE_URL];
    const defaultInstanceURL = publicRuntimeConfig.myriadAPIURL;

    const anonymous = !session?.user;
    const apiURL =
      sessionInstanceURL ??
      queryInstanceURL ??
      cookiesInstanceURL ??
      defaultInstanceURL;

    const available = await healthcheck(apiURL);

    if (!available) {
      return {
        redirect: {
          destination: '/maintenance',
          permanent: false,
        },
      };
    }

    initialize({ cookie: req.headers.cookie }, anonymous);

    res.setHeader('set-cookie', [`${COOKIE_INSTANCE_URL}=${apiURL}`]);

    await dispatch(fetchUser());
    await Promise.all([
      dispatch(fetchServer(sessionInstanceURL)),
      dispatch(fetchNetwork()),
      dispatch(fetchAvailableToken()),
      dispatch(fetchExchangeRates()),
      dispatch(fetchUserExperience()),
      dispatch(fetchUserWallets()),
      dispatch(fetchConnectedSocials()),
      dispatch(fetchFriend()),
      dispatch(countNewNotification()),
    ]);

    return {
      props: {
        session,
      },
    };
  },
);

export default Friends;
