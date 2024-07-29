module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:storybook/recommended',
  ],
  ignorePatterns: ['**/public/*.js'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-useless-escape': ['warn'],
    'jsx-a11y/click-events-have-key-events': ['warn'],
    'jsx-a11y/interactive-supports-focus': ['warn'],
    'jsx-a11y/no-static-element-interactions': ['warn'],
    'jsx-a11y/no-noninteractive-element-interactions': ['warn'],
    'jsx-a11y/anchor-is-valid': ['warn'],
    'react/display-name': ['warn'],
    'react/no-unescaped-entities': ['warn'],
    'react/prop-types': ['off'],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': ['warn'],
    '@typescript-eslint/no-empty-interface': ['warn'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { vars: 'local', args: 'none' },
    ],
  },
};
