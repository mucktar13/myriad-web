import React from 'react';

import {getSession} from 'next-auth/client';
import {useRouter} from 'next/router';

import {SettingsContainer, SettingsType, useSettingList} from 'src/components-v2/Settings';
import {ToasterContainer} from 'src/components-v2/atoms/Toaster/ToasterContainer';
import {TopNavbarComponent, SectionTitle} from 'src/components-v2/atoms/TopNavbar';
import {DefaultLayout} from 'src/components-v2/template/Default/DefaultLayout';
import {healthcheck} from 'src/lib/api/healthcheck';
import {fetchAvailableToken} from 'src/reducers/config/actions';
import {fetchExperience} from 'src/reducers/experience/actions';
import {countNewNotification} from 'src/reducers/notification/actions';
import {setAnonymous, fetchConnectedSocials, fetchUser} from 'src/reducers/user/actions';
import {wrapper} from 'src/store';
import {ThunkDispatchAction} from 'src/types/thunk';

const Settings: React.FC = () => {
  const {query} = useRouter();

  const settings = useSettingList();

  const currentSection = query.section as SettingsType | undefined;

  const selected = settings.find(item => item.id === currentSection);

  //TODO: any logic + components which replace
  // the middle column of home page should go here

  return (
    <DefaultLayout isOnProfilePage={false}>
      <TopNavbarComponent
        description={
          selected ? `${selected.title} Settings` : 'Set Privacy and Notification settings'
        }
        sectionTitle={SectionTitle.SETTINGS}
      />
      <SettingsContainer />
      <ToasterContainer />
    </DefaultLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(store => async context => {
  const dispatch = store.dispatch as ThunkDispatchAction;

  if (typeof window === 'undefined') {
    const DeviceDetect = eval('require("node-device-detector")');

    const device = new DeviceDetect();
    const {
      device: {type},
    } = device.detect(context.req.headers['user-agent']);

    if (type === 'smartphone') {
      return {
        redirect: {
          destination: '/mobile',
          permanent: false,
          headers: context.req.headers,
        },
      };
    }
  }

  const available = await healthcheck();

  if (!available) {
    return {
      redirect: {
        destination: '/maintenance',
        permanent: false,
      },
    };
  }

  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const anonymous = Boolean(session?.user.anonymous);
  const userId = session?.user.address as string;

  if (anonymous || !userId) {
    const username = session?.user.name as string;

    await dispatch(setAnonymous(username));
  } else {
    await dispatch(fetchUser(userId));

    await Promise.all([
      dispatch(fetchConnectedSocials()),
      dispatch(fetchAvailableToken()),
      dispatch(countNewNotification()),
      dispatch(fetchExperience()),
    ]);
  }

  return {
    props: {
      session,
    },
  };
});

export default Settings;
