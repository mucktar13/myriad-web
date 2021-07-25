import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Session} from 'next-auth';
import {getSession} from 'next-auth/client';

import Typography from '@material-ui/core/Typography';

import {wrapper} from '../src/store';

import Layout from 'src/components/Layout/Layout.container';
import ProfileTimeline from 'src/components/profile/profile.component';
import {healthcheck} from 'src/lib/api/healthcheck';
import * as ProfileAPI from 'src/lib/api/profile';
import * as UserAPI from 'src/lib/api/user';
import {RootState} from 'src/reducers';
import {setProfile} from 'src/reducers/profile/actions';
import {ProfileState} from 'src/reducers/profile/reducer';
import {setAnonymous, setUser, fetchToken} from 'src/reducers/user/actions';

type ProfilePageProps = {
  session: Session;
  found: boolean;
};

const ProfilePageComponent: React.FC<ProfilePageProps> = () => {
  const dispatch = useDispatch();

  const {detail: profileDetail} = useSelector<RootState, ProfileState>(state => state.profileState);

  useEffect(() => {
    // load current authenticated user tokens
    dispatch(fetchToken());
  }, [dispatch]);

  return (
    <Layout>
      {!profileDetail ? (
        <div style={{textAlign: 'center'}}>
          <h1>This account doesn’t exist</h1>
          <Typography>Try searching for another.</Typography>
        </div>
      ) : (
        <ProfileTimeline profile={profileDetail} loading={false} />
      )}
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(store => async context => {
  const {res, params} = context;
  const {dispatch} = store;

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
  const profileId = params?.id as string;

  //TODO: this process should call thunk action creator instead of dispatch thunk acion
  //ISSUE: state not hydrated when using thunk action creator
  if (anonymous) {
    dispatch(setAnonymous(username));
  } else {
    const user = await UserAPI.getUserDetail(userId);

    dispatch(setUser(user));
  }

  const profile = await ProfileAPI.getUserProfile(profileId);

  if (profile) {
    dispatch(setProfile(profile));
  }

  return {
    props: {
      session,
      found: profile !== null,
    },
  };
});

export default ProfilePageComponent;
