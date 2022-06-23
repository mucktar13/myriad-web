/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  i18n: {
    debug: process.env.NODE_ENV === 'development',
    defaultLocale: 'en',
    locales: ['en', 'id', 'ru'],
    localePath: path.resolve('./src/locale'),
    localeExtension: 'ts',
    defaultNS: 'common',
  },
};
