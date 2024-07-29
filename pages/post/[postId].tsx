import * as Sentry from '@sentry/nextjs';

import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import getConfig from 'next/config';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

import axios from 'axios';
import { stringify } from 'components/PostCreate/formatter';
import { PostDetailContainer } from 'components/PostDetail/PostDetail.container';
import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import parse from 'html-react-parser';
import { TopNavbarComponent } from 'src/components/atoms/TopNavbar';
import { TippingSuccess } from 'src/components/common/Tipping/render/Tipping.success';
import { DefaultLayout } from 'src/components/template/Default/DefaultLayout';
import { generateAnonymousUser } from 'src/helpers/auth';
import { htmlToJson, isJson } from 'src/helpers/string';
import { Sizes } from 'src/interfaces/assets';
import { Post } from 'src/interfaces/post';
import { User } from 'src/interfaces/user';
import { updateSession } from 'src/lib/api/auth-link';
import { initialize } from 'src/lib/api/base';
import { healthcheck } from 'src/lib/api/healthcheck';
import * as PostAPI from 'src/lib/api/post';
import { createOpenGraphImageUrl } from 'src/lib/config';
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
import { setPost } from 'src/reducers/timeline/actions';
import {
  setAnonymous,
  fetchConnectedSocials,
  fetchUser,
  fetchUserExperience,
  fetchNetwork,
  fetchUserWallets,
} from 'src/reducers/user/actions';
import { wrapper } from 'src/store';
import { ThunkDispatchAction } from 'src/types/thunk';

const { publicRuntimeConfig } = getConfig();

const ResourceDeleted = dynamic(
  () => import('src/components/common/ResourceDeleted/ResourceDeleted'),
);

type PostPageProps = {
  removed: boolean;
  title: string;
  description: string;
  image: string | null;
  session: Session;
};

type PostPageParams = {
  postId: string;
};

const PostPage: React.FC<PostPageProps> = props => {
  const { removed, title, description, image, session } = props;
  useEffect(() => {
    if (!session?.user?.instanceURL) updateSession(session);
  }, [session]);

  const router = useRouter();
  const user = useSelector<RootState, User>(
    state => state.userState.user,
    shallowEqual,
  );
  const post = useSelector<RootState, Post>(
    state => state.timelineState.post,
    shallowEqual,
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vote = useSelector<RootState, number>(
    state =>
      state.timelineState.post?.metric?.upvotes -
      state.timelineState.post?.metric?.downvotes,
    shallowEqual,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const comments = useSelector<RootState, number>(
    state => state.timelineState.post?.metric?.comments,
    shallowEqual,
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={publicRuntimeConfig.appAuthURL + router.asPath}
        />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="2024" />
        <meta property="og:image:height" content="1012" />
        <meta property="og:image:secure_url" content={image} />
        {/* Twitter Card tags */}
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <DefaultLayout isOnProfilePage={false} {...props}>
        <TopNavbarComponent
          description={i18n.t('Post_Detail.Navbar.Title')}
          sectionTitle={i18n.t('Section.Timeline')}
        />
        {removed ? (
          <ResourceDeleted />
        ) : (
          <PostDetailContainer
            post={post}
            user={user}
            expand
            metric={post.metric}
            preview
          />
        )}

        <TippingSuccess />
      </DefaultLayout>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  store => async context => {
    const { req, res, query } = context;
    const { cookies } = req;

    const dispatch = store.dispatch as ThunkDispatchAction;
    const params = context.params as PostPageParams;
    let showAsDeleted = false;

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

    let userId: string | undefined = undefined;
    let post: Post | undefined = undefined;

    res.setHeader('set-cookie', [`${COOKIE_INSTANCE_URL}=${apiURL}`]);

    initialize({ cookie: req.headers.cookie }, anonymous);

    try {
      if (!anonymous) {
        // TODO: fix ThunkDispatch return type
        const user = (await dispatch(fetchUser())) as any;
        userId = user?.id;
      }

      const originPost = await PostAPI.getPostDetail(params.postId, userId);
      const upvotes = originPost.votes
        ? originPost.votes.filter(vote => vote.userId === userId && vote.state)
        : [];
      const downvotes = originPost.votes
        ? originPost.votes.filter(vote => vote.userId === userId && !vote.state)
        : [];

      post = {
        ...originPost,
        isUpvoted: upvotes.length > 0,
        isDownVoted: downvotes.length > 0,
        totalComment: originPost.metric.comments,
      };

      dispatch(setPost(post));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        showAsDeleted = true;
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

    let description =
      post?.text ??
      'The owner might be changed their privacy settings, shared it for certain group of people or it’s been deleted';
    let title = post
      ? post?.title ?? `${post.user.name} on ${publicRuntimeConfig.appName}`
      : 'We cannot find what you are looking for';

    let image = null; // Default value for image

    if (post) {
      // Check if post exists
      if (post.asset?.images && post.asset.images.length > 0) {
        // Check if images array is present and not empty
        if (typeof post.asset.images[0] === 'string') {
          // Check if the first item is a string
          image = post.asset.images[0];
        }
        // If the first item is not a string, access its 'large' property
        image = (post.asset.images[0] as Sizes).large;
      }
      image = createOpenGraphImageUrl(
        publicRuntimeConfig.appAuthURL,
        description,
      );
    }

    if (post?.platform === 'myriad') {
      const { text, image: imageData } = stringify(post);
      const isHtmlContent = !isJson(post.text);
      if (isHtmlContent) {
        description = htmlToJson(parse(post.text)).text;
        image = htmlToJson(parse(post.text)).img[0] ?? '';
      } else {
        description = text;
        image = imageData;
      }

      title =
        post?.title ?? `${post.user.name} on ${publicRuntimeConfig.appName}`;
    }

    if (post?.platform !== 'myriad') {
      title = `${post.people.name} (imported by ${post.user.name} on ${publicRuntimeConfig.appName})`;
    }

    if (post?.deletedAt || post?.isNSFW || post?.NSFWTag) {
      title = 'Login with Myriad Account';
      description =
        'Log in to Myriad Social! Not a Myriad user? Sign up for free.';
      image = createOpenGraphImageUrl(publicRuntimeConfig.appAuthURL, title);
    }

    return {
      props: {
        title,
        description,
        image,
        removed: showAsDeleted,
      },
    };
  },
);

export default PostPage;
