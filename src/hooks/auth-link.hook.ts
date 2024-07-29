//TODO
//1. Create api file for auth with link
//2. Use it with loginWithEmail
import getConfig from 'next/config';

import * as AuthLinkAPI from 'src/lib/api/auth-link';

//3. When clicking on link, parse the query on /login
//4. Create api call for POST /login/otp with useEffect when parsing query on /login
//5. Call signIn with otp and email, check if it exists and no signature is required, and then call the api call in #4

const { publicRuntimeConfig } = getConfig();

export const useAuthLinkHook = () => {
  const requestLink = async (
    email: string,
    apiURL?: string,
  ): Promise<string> => {
    try {
      const message = await AuthLinkAPI.getLinkWithEmail(
        {
          email,
          callbackURL: publicRuntimeConfig.appAuthURL + '/login',
        },
        apiURL,
      );

      return message;
    } catch (error) {
      return error;
    }
  };

  return {
    requestLink,
  };
};
