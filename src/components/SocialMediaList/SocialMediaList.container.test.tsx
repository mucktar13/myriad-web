import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

jest.mock('next/router', () => require('next-router-mock'));
jest.mock('next-auth/react');

describe('Social Media List Container', () => {
  // TODO: fix with redux
  it('render social media list container', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        name: 'jest',
        address: 'jest.testnet',
        anonymous: false,
        token: 'sample-token',
        nonce: 123,
        id: 'sample-id-user',
        instanceURL: 'https://api.testnet.myriad.com',
        username: 'jest',
        loginType: '',
      },
    };
    (useSession as jest.Mock).mockReturnValue([mockSession, false]);
  });
});
