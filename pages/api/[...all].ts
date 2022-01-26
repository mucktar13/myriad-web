import type {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from 'next-auth/client';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import getConfig from 'next/config';

import {decryptMessage} from 'src/lib/crypto';

const {serverRuntimeConfig} = getConfig();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {secret} = serverRuntimeConfig;
    const session = await getSession({req});

    let headers = {};
    if (session && session.user) {
      let userToken = '';

      userToken = decryptMessage(
        session.user.token as string,
        secret,
        session.user.initVec as string,
      );
      console.log('userToken', userToken);
      headers = {
        Authorization: `Bearer ${userToken}`,
      };
    }

    return httpProxyMiddleware(req, res, {
      // You can use the `http-proxy` option
      target: serverRuntimeConfig.myriadAPIURL,
      // In addition, you can use the `pathRewrite` option provided by `next-http-proxy`
      pathRewrite: [
        {
          patternStr: '/api',
          replaceStr: '/',
        },
      ],
      changeOrigin: true,
      headers,
    });
  } catch (error) {
    console.log({error});
  }
};
