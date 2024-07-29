import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import httpProxyMiddleware from 'next-http-proxy-middleware';
import getConfig from 'next/config';

import { COOKIE_INSTANCE_URL } from 'components/SelectServer';
import { isErrorWithMessage } from 'src/helpers/error';
import { decryptMessage } from 'src/lib/crypto';

const { publicRuntimeConfig } = getConfig();

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let headers = {};

  try {
    const session = await getSession({ req });
    const sessionInstanceURL = session?.user?.instanceURL;
    const cookiesInstanceURL = req.cookies[COOKIE_INSTANCE_URL];
    const instanceURL = sessionInstanceURL ?? cookiesInstanceURL;

    if (session?.user?.token) {
      const key = session.user.username.replace(/[^a-zA-Z0-9]/g, '');
      const userToken = decryptMessage(session.user.token, key);

      headers = {
        Authorization: `Bearer ${userToken}`,
      };
    }

    return httpProxyMiddleware(req, res, {
      // You can use the `http-proxy` option
      target: instanceURL ?? publicRuntimeConfig.myriadAPIURL,
      // In addition, you can use the `pathRewrite` option provided by `next-http-proxy`
      pathRewrite: [
        {
          patternStr: '/api',
          replaceStr: '',
        },
      ],
      changeOrigin: true,
      headers,
    });
  } catch (error) {
    let message = 'Unknown error';

    if (isErrorWithMessage(error)) {
      message = error.message;
    }

    console.error('[api-proxy][error]', { error: message });
    res.status(500).send({ error: message });
  }
}
