import React, {useEffect} from 'react';

import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/client';
import {useRouter} from 'next/router';

import {Login} from 'src/components-v2/Login';
import {LoginLayout} from 'src/components-v2/template/Login';
import AlertComponent from 'src/components/alert/Alert.component';
import {useAlertHook} from 'src/hooks/use-alert.hook';
import {healthcheck} from 'src/lib/api/healthcheck';

export default function Index() {
  const {query} = useRouter();

  const {showAlert} = useAlertHook();

  useEffect(() => {
    if (query.error) {
      showAlert({
        message: 'Something wrong when try to loggedin.',
        severity: 'error',
        title: 'Login failed',
      });
    }
  }, [query.error]);

  return (
    <>
      <LoginLayout>
        <Login />
        <AlertComponent />
      </LoginLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const {res} = context;

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
    res.setHeader('location', '/maintenance');
    res.statusCode = 302;
    res.end();
  }

  const session = await getSession(context);

  if (session) {
    res.setHeader('location', '/home');
    res.statusCode = 302;
    res.end();
  }

  return {
    props: {},
  };
};
