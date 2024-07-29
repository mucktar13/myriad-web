import * as Sentry from '@sentry/nextjs';

import React, { useEffect } from 'react';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { ProfileContainer } from 'components/Profile';
import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import { TopNavbarComponent } from 'components/atoms/TopNavbar';
import { TippingSuccess } from 'src/components/common/Tipping/render/Tipping.success';
import { DefaultLayout } from 'src/components/template/Default/DefaultLayout';
import { generateAnonymousUser } from 'src/helpers/auth';
import { updateSession } from 'src/lib/api/auth-link';
import { initialize } from 'src/lib/api/base';
import { healthcheck } from 'src/lib/api/healthcheck';
import * as UserAPI from 'src/lib/api/user';
import { createOpenGraphImageUrl } from 'src/lib/config';
import i18n from 'src/locale';
import {
  fetchAvailableToken,
  fetchFilteredToken,
  setPrivacySetting,
} from 'src/reducers/config/actions';
import { fetchExchangeRates } from 'src/reducers/exchange-rate/actions';
import { fetchFriend } from 'src/reducers/friend/actions';
import { countNewNotification } from 'src/reducers/notification/actions';
import { setProfile } from 'src/reducers/profile/actions';
import { fetchServer } from 'src/reducers/server/actions';
import {
  setAnonymous,
  fetchConnectedSocials,
  fetchUser,
  fetchUserExperience,
  fetchUserWallets,
  fetchNetwork,
} from 'src/reducers/user/actions';
import { wrapper } from 'src/store';
import { ThunkDispatchAction } from 'src/types/thunk';

type ProfilePageProps = {
  session: Session;
  title: string;
  description: string;
  image: string | null;
  isBanned: boolean;
};

const { publicRuntimeConfig } = getConfig();

const ProfilePageComponent: React.FC<ProfilePageProps> = props => {
  const { title, description, image, isBanned, session } = props;
  useEffect(() => {
    if (!session?.user?.instanceURL) updateSession(session);
  }, [session]);

  const router = useRouter();

  return (
    <DefaultLayout isOnProfilePage={true} {...props}>
      <Head>
        <title>{title}</title>
        <meta property="og:type" content="profile" />
        <meta
          property="og:url"
          content={publicRuntimeConfig.appAuthURL + router.asPath}
        />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:secure_url" content={image} />
        <meta property="og:image:width" content="2024" />
        <meta property="og:image:height" content="1012" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <>
        <TopNavbarComponent
          sectionTitle={title}
          description={i18n.t('TopNavbar.Title.Profile')}
        />
        <ProfileContainer banned={isBanned} />
      </>

      <TippingSuccess />
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  store => async context => {
    const { params, req, query, res } = context;
    const { cookies } = req;

    const dispatch = store.dispatch as ThunkDispatchAction;

    let session: Session | null = null;

    try {
      session = await getSession(context);
    } catch {
      // ignore
    }

    const queryInstanceURL = query.instance;
    const sessionInstanceURL = session?.user?.instanceURL;
    const cookiesInstanceURL = cookies[COOKIE_INSTANCE_URL];
    const defaultInstanceURL = publicRuntimeConfig.myriadAPIURL;

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

    const anonymous = !session?.user;

    const userId = session?.user.address as string;
    const profileId = params?.id as string;
    const usernameParams = params?.profileByUserName as string;
    const usernameOrId = profileId || usernameParams;

    initialize({ cookie: req.headers.cookie }, anonymous);

    res.setHeader('set-cookie', [`${COOKIE_INSTANCE_URL}=${apiURL}`]);

    if (anonymous) {
      const username = generateAnonymousUser();
      await dispatch(setAnonymous(username));
    } else {
      await dispatch(fetchUser());
      await Promise.all([
        dispatch(fetchUserWallets()),
        dispatch(fetchConnectedSocials()),
        dispatch(fetchFriend()),
        dispatch(countNewNotification()),
      ]);
    }

    await Promise.all([
      dispatch(fetchServer(apiURL)),
      dispatch(fetchNetwork()),
      dispatch(fetchAvailableToken()),
      dispatch(fetchFilteredToken()),
      dispatch(fetchExchangeRates()),
      dispatch(fetchUserExperience()),
    ]);

    try {
      const detail = await UserAPI.getUserDetail(usernameOrId, userId);
      const privacySetting = detail?.accountSetting ?? {
        accountPrivacy: 'public',
        socialMediaPrivacy: 'public',
      };

      await dispatch(setProfile(detail));
      await dispatch(setPrivacySetting(privacySetting));

      return {
        props: {
          session,
          title: detail?.name ?? "Myriad User's Profile",
          description: detail?.bio ?? "Myriad User's Bio",
          image:
            detail?.profilePictureURL ??
            createOpenGraphImageUrl(
              publicRuntimeConfig.appAuthURL,
              'Myriad User Profile',
            ),
          isBanned: Boolean(detail?.deletedAt),
        },
      };
    } catch (error) {
      Sentry.captureException(error);

      return {
        notFound: true,
      };
    }
  },
);

export default ProfilePageComponent;
