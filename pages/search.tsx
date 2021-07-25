import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {Session} from 'next-auth';
import {getSession} from 'next-auth/client';
import dynamic from 'next/dynamic';

import Grid from '@material-ui/core/Grid';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

import Layout from 'src/components/Layout/Layout.container';
import {LoadingBasic} from 'src/components/common/LoadingBasic.component';
import SearchResultComponent from 'src/components/search/search-result.component';
import TopicComponent from 'src/components/topic/topic.component';
import UserDetail from 'src/components/user/user.component';
import {useSearch} from 'src/hooks/use-search.hooks';
import {healthcheck} from 'src/lib/api/healthcheck';
import * as UserAPI from 'src/lib/api/user';
import {RootState} from 'src/reducers';
import {setAnonymous, setUser, fetchToken} from 'src/reducers/user/actions';
import {UserState} from 'src/reducers/user/reducer';
import {wrapper} from 'src/store';

const WalletComponent = dynamic(() => import('src/components/wallet/wallet.component'), {
  ssr: false,
});

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    user: {
      flex: '0 0 327px',
      width: 327,
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
      padding: '0 24px 0 24px',
      marginRight: 'auto',
      marginLeft: 'auto',
      height: '100vh',
      maxWidth: 726,
      flex: 1,
      [theme.breakpoints.up('xl')]: {
        maxWidth: 926,
      },
    },
    loading: {
      left: 'calc(50% - 20px)',
      position: 'absolute',
      top: 100,
    },
  }),
);

type SearchPageProps = {
  session: Session;
  query: string;
};

const SearchPage: React.FC<SearchPageProps> = ({query}) => {
  const style = useStyles();
  const dispatch = useDispatch();

  const {loading, results, search} = useSearch();
  const {anonymous} = useSelector<RootState, UserState>(state => state.userState);

  // load search result each query string updated
  useEffect(() => {
    search(query);
  }, [query]);

  useEffect(() => {
    // load current authenticated user tokens
    dispatch(fetchToken());
  }, [dispatch]);

  return (
    <Layout search={query}>
      <Grid item className={style.user}>
        <Grid container direction="row" justify="flex-start" alignContent="flex-start">
          <Grid item className={style.fullwidth}>
            <UserDetail isAnonymous={anonymous} />
          </Grid>
          <Grid item className={style.fullwidth}>
            <WalletComponent />

            <TopicComponent />
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={style.content}>
        <div id="search-result">
          {loading ? <LoadingBasic /> : <SearchResultComponent options={results} query={query} />}
        </div>
      </Grid>
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(store => async context => {
  const {res, query} = context;
  const {dispatch} = store;

  const search = query.q;

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

    dispatch(setUser(user));
  }

  return {
    props: {
      session,
      query: search,
    },
  };
});

export default SearchPage;
