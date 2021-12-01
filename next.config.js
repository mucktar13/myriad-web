/* eslint-disable @typescript-eslint/no-var-requires */
const {withSentryConfig} = require('@sentry/nextjs');

const moduleExports = {
  future: {
    webpack5: false,
  },
  experimental: {
    reactRefresh: true,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    nextAuthURL: process.env.NEXTAUTH_URL,
    secret: process.env.SECRET,
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
    cloudinaryAPIKey: process.env.CLOUDINARY_API_KEY,
    cloudinarySecret: process.env.CLOUDINARY_SECRET,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    appStatus: process.env.NEXT_PUBLIC_APP_STATUS,
    apiURL: process.env.NEXT_PUBLIC_API_URL,
    nextAuthURL: process.env.NEXTAUTH_URL,
    facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    myriadWsRPC: process.env.NEXT_PUBLIC_MYRIAD_WS_RPC,
    myriadWebsite: process.env.NEXT_PUBLIC_MYRIAD_WEBSITE ?? 'https://www.myriad.social',
    myriadSupportMail: process.env.NEXT_PUBLIC_MYRIAD_SUPPORT_MAIL ?? 'support@myriad.social',
    cloudinaryName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    firebaseAPIKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
