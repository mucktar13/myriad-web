import * as Sentry from '@sentry/nextjs';

import React, { useEffect } from 'react';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';

import axios from 'axios';
import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import { TopNavbarComponent } from 'components/atoms/TopNavbar';
import { ResourceDeleted } from 'components/common/ResourceDeleted';
import { ExperiencePreviewContainer } from 'src/components/ExperiencePreview/ExperiencePreview.container';
import { DefaultLayout } from 'src/components/template/Default/DefaultLayout';
import { generateAnonymousUser } from 'src/helpers/auth';
import { User } from 'src/interfaces/user';
import { updateSession } from 'src/lib/api/auth-link';
import { initialize } from 'src/lib/api/base';
import * as ExperienceAPI from 'src/lib/api/experience';
import { healthcheck } from 'src/lib/api/healthcheck';
import { createOpenGraphImageUrl } from 'src/lib/config';
import i18n from 'src/locale';
import { fetchAvailableToken } from 'src/reducers/config/actions';
import { fetchExchangeRates } from 'src/reducers/exchange-rate/actions';
import { fetchFriend } from 'src/reducers/friend/actions';
import { countNewNotification } from 'src/reducers/notification/actions';
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

const { publicRuntimeConfig } = getConfig();

type ExperiencePageProps = {
  title: string;
  description: string | null;
  image: string | null;
  session: Session;
  hidden: boolean;
};

const PreviewExperience: React.FC<ExperiencePageProps> = props => {
  const { title, image, description, hidden, session } = props;
  useEffect(() => {
    if (!session?.user?.instanceURL) updateSession(session);
  }, [session]);

  const router = useRouter();

  return (
    <DefaultLayout isOnProfilePage={false} {...props}>
      <Head>
        <title>{title}</title>
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={publicRuntimeConfig.appAuthURL + router.asPath}
        />
        <meta property="og:description" content={description ?? ''} />
        <meta property="og:title" content={title} />
        {image && <meta property="og:image" content={image} />}
        <meta property="og:image:width" content="2024" />
        <meta property="og:image:height" content="1012" />
        <meta property="og:image:secure_url" content={image} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description ?? ''} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {hidden ? (
        <>
          <TopNavbarComponent
            description={i18n.t('TopNavbar.Title.Experience')}
            sectionTitle={i18n.t('Section.Timeline')}
          />
          <ResourceDeleted />
        </>
      ) : (
        <ExperiencePreviewContainer />
      )}
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  store => async context => {
    const { params, req, query, res } = context;
    const { cookies } = req;

    const experienceId = params?.experienceId as string;
    let hidden = false,
      description = 'Timeline',
      title = 'Myriad - Timeline',
      image =
        'https://storage.googleapis.com/myriad-social-mainnet.appspot.com/assets/myriad_logo.svg';

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

    res.setHeader('set-cookie', [`${COOKIE_INSTANCE_URL}=${apiURL}`]);

    const anonymous = !session?.user;

    initialize({ cookie: req.headers.cookie }, anonymous);

    try {
      const experience = await ExperienceAPI.getExperienceDetail(experienceId);

      if (experience?.visibility === 'selected_user') {
        if (anonymous) hidden = true;

        const user = (await dispatch(fetchUser())) as unknown as User;
        const found = experience?.selectedUserIds?.find(
          e => e.userId === user?.id,
        );
        if (!found && experience?.createdBy !== user?.id) hidden = true;
      }

      if (experience?.visibility === 'private') {
        const user = (await dispatch(fetchUser())) as unknown as User;
        if (experience?.createdBy !== user?.id) hidden = true;
      }

      description = experience?.description ?? '-';
      title = experience.name;
      image = experience.experienceImageURL;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        hidden = true;
      } else {
        Sentry.captureException(error);

        return {
          notFound: true,
        };
      }
    }

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
      dispatch(fetchExchangeRates()),
      dispatch(fetchUserExperience()),
    ]);

    return {
      props: {
        title: title,
        description: description,
        image:
          image ??
          createOpenGraphImageUrl(publicRuntimeConfig.appAuthURL, title),
        hidden: hidden,
      },
    };
  },
);

export default PreviewExperience;
