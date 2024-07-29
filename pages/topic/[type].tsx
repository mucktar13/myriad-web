import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { capitalize } from '@material-ui/core';

import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import { PostsListContainer } from 'src/components/PostList';
import { TopNavbarComponent } from 'src/components/atoms/TopNavbar';
import { DefaultLayout } from 'src/components/template/Default/DefaultLayout';
import { Experience } from 'src/interfaces/experience';
import { People } from 'src/interfaces/people';
import { User } from 'src/interfaces/user';
import { updateSession } from 'src/lib/api/auth-link';
import { initialize } from 'src/lib/api/base';
import * as ExperienceAPI from 'src/lib/api/experience';
import { healthcheck } from 'src/lib/api/healthcheck';
import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import {
  fetchAvailableToken,
  fetchFilteredToken,
} from 'src/reducers/config/actions';
import { fetchExchangeRates } from 'src/reducers/exchange-rate/actions';
import { fetchFriend } from 'src/reducers/friend/actions';
import { countNewNotification } from 'src/reducers/notification/actions';
import { fetchServer } from 'src/reducers/server/actions';
import { fetchPopularTopic } from 'src/reducers/tag/actions';
import { updateFilter } from 'src/reducers/timeline/actions';
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

type TopicPageProps = {
  experience: Experience | null;
  session: Session;
};

type TopicsQueryProps = {
  tag?: string;
  type: 'hashtag' | 'experience';
};

const Topic: React.FC<TopicPageProps> = props => {
  const { experience, session } = props;
  useEffect(() => {
    if (!session?.user?.instanceURL) updateSession(session);
  }, [session]);
  const { query } = useRouter();

  const { type, tag } = query as TopicsQueryProps;

  const user = useSelector<RootState, User>(state => state.userState.user);

  return (
    <DefaultLayout isOnProfilePage={false} {...props}>
      <Head>
        <title>
          {i18n.t('Topics.Title', { appname: publicRuntimeConfig.appName })}
        </title>
      </Head>

      <TopNavbarComponent
        description={type === 'hashtag' ? 'Topics' : 'Experience'}
        sectionTitle={
          type === 'hashtag'
            ? `#${capitalize(tag as string)}`
            : (experience?.name as string)
        }
      />

      <PostsListContainer user={user} query={query} />
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  store => async context => {
    const { query, req, res } = context;
    const { cookies } = req;

    const dispatch = store.dispatch as ThunkDispatchAction;

    if (!['experience', 'hashtag'].includes(query.type as string)) {
      return {
        notFound: true,
      };
    }

    let session: Session | null = null;

    try {
      session = await getSession(context);
    } catch {
      // ignore
    }

    if (!session?.user) {
      return {
        redirect: {
          destination: '/login',
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
      dispatch(fetchNetwork()),
      dispatch(fetchAvailableToken()),
      dispatch(fetchFilteredToken()),
      dispatch(fetchExchangeRates()),
      dispatch(fetchUserExperience()),
      dispatch(fetchPopularTopic()),
      dispatch(fetchUserWallets()),
      dispatch(fetchConnectedSocials()),
      dispatch(fetchFriend()),
      dispatch(countNewNotification()),
    ]);

    await dispatch(fetchServer(sessionInstanceURL));
    await dispatch(fetchNetwork());
    await dispatch(fetchExchangeRates());
    await dispatch(fetchUserExperience());

    let experience: Experience | null = null;

    if (query.type === 'hashtag' && query.tag) {
      await dispatch(
        updateFilter({
          tags: Array.isArray(query.tag) ? query.tag : [query.tag],
        }),
      );
    }

    if (query.type === 'experience') {
      if (!query.id) {
        return {
          notFound: true,
        };
      }

      try {
        const userExperience = await ExperienceAPI.getUserExperienceDetail(
          query.id as string,
        );

        experience = userExperience.experience;

        await dispatch(
          updateFilter({
            tags: experience.allowedTags
              ? (experience.allowedTags as string[])
              : [],
            people: experience.people
              .filter((person: People) => !person.hide)
              .map((person: People) => person.id),
          }),
        );
      } catch (error) {
        return {
          notFound: true,
        };
      }
    }

    return {
      props: {
        session,
        experience,
      },
    };
  },
);

export default Topic;
