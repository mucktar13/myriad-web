import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {getSession} from 'next-auth/client';

import Grid from '@material-ui/core/Grid';
import NoSsr from '@material-ui/core/NoSsr';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

import Layout from 'src/components/Layout/Layout.container';
import Timeline from 'src/components/timeline/timeline.component';
import TopicComponent from 'src/components/topic/topic.component';
import UserDetail from 'src/components/user/user.component';
import {Wallet} from 'src/components/wallet/wallet.component';
import {generateImageSizes} from 'src/helpers/cloudinary';
import {healthcheck} from 'src/lib/api/healthcheck';
import * as UserAPI from 'src/lib/api/user';
import {RootState} from 'src/reducers';
import {setAnonymous, setUser, fetchToken} from 'src/reducers/user/actions';
import {UserState} from 'src/reducers/user/reducer';
import {wrapper} from 'src/store';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    user: {
      width: 327,
      flex: '0 0 327px',
      marginRight: 0,
      'scrollbar-color': '#A942E9 #171717',
      'scrollbar-width': 'thin !important',
    },
    wallet: {
      width: 327,
    },
    fullwidth: {
      width: 327,
    },
    fullheight: {
      height: '100vh',
    },
    profile: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      marginLeft: 'auto',
      marginRight: 'auto',
      padding: '0 24px 0 24px',
      height: '100vh',
      maxWidth: 726,
      [theme.breakpoints.up('xl')]: {
        maxWidth: 926,
      },
    },
  }),
);

const Home: React.FC = () => {
  const style = useStyles();

  const {anonymous, tokens} = useSelector<RootState, UserState>(state => state.userState);
  const dispatch = useDispatch();

  useEffect(() => {
    // load current authenticated user tokens
    dispatch(fetchToken());
  }, [dispatch]);

  return (
    <Layout>
      <Grid item className={style.user}>
        <Grid container direction="row" justify="flex-start" alignContent="flex-start">
          <Grid item className={style.fullwidth}>
            <UserDetail isAnonymous={anonymous} />
          </Grid>
          <Grid item className={style.fullwidth}>
            <NoSsr>
              <Wallet />
            </NoSsr>

            <TopicComponent />
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={style.content}>
        <Timeline isAnonymous={anonymous} availableTokens={tokens} />
      </Grid>
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(store => async context => {
  const {dispatch} = store;
  const {res} = context;

  const available = await healthcheck();

  if (!available) {
    res.setHeader('location', '/maintenance');
    res.statusCode = 302;
    res.end();
  }

  const session = await getSession(context);

  if (!session) {
    res.setHeader('location', '/');
    res.statusCode = 302;
    res.end();
  }

  const anonymous = Boolean(session?.user.anonymous);
  const userId = session?.user.id as string;
  const username = session?.user.name as string;

  //TODO: this process should call thunk action creator instead of dispatch thunk acion
  //ISSUE: state not hydrated when using thunk action creator
  if (anonymous) {
    dispatch(setAnonymous(username));
  } else {
    const user = await UserAPI.getUserDetail(userId);

    if (user.profilePictureURL) {
      user.profile_picture = {
        sizes: generateImageSizes(user.profilePictureURL),
      };
    }

    dispatch(setUser(user));
  }

  return {
    props: {
      session,
    },
  };
});

export default Home;
