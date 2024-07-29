import {
  SparklesIcon,
  CogIcon,
  UsersIcon,
  PhotographIcon,
  HashtagIcon,
  ViewGridIcon,
  CreditCardIcon,
  GlobeAltIcon,
} from '@heroicons/react/outline';

import React, { useMemo } from 'react';

import { CustomFolderIcon } from './Menu';

import i18n from 'src/locale';

export type MenuRightId =
  | 'friends'
  | 'token'
  | 'town'
  | 'nft'
  | 'settings'
  | 'experience-trend'
  | 'experience'
  | 'wallet'
  | 'trends'
  | 'socials';

export type MenuRightDetail = {
  id: MenuRightId;
  title: string;
  active: boolean;
  icon: React.ReactNode;
  url: string;
  isDesktop: boolean;
  isAnimated: boolean;
};

export const useMenuRightList = (selected: MenuRightId): MenuRightDetail[] => {
  const menu: MenuRightDetail[] = useMemo(
    () => [
      {
        id: 'trends',
        title: i18n.t('Section.Trends'),
        active: selected === 'trends',
        icon: HashtagIcon,
        url: '/topic',
        isDesktop: false,
        isAnimated: false,
      },
      {
        id: 'friends',
        title: i18n.t('Section.Friends'),
        active: selected === 'friends',
        icon: UsersIcon,
        url: '/friends',
        isDesktop: true,
        isAnimated: false,
      },
      {
        id: 'nft',
        title: i18n.t('Section.NFT'),
        active: selected === 'nft',
        icon: PhotographIcon,
        url: '/nft',
        isDesktop: true,
        isAnimated: false,
      },
      {
        id: 'town',
        title: i18n.t('Section.Myriad_Town'),
        active: selected === 'town',
        icon: SparklesIcon,
        url: '/town',
        isDesktop: true,
        isAnimated: true,
      },

      {
        id: 'socials',
        title: i18n.t('Section.Social_Media'),
        active: selected === 'socials',
        icon: ViewGridIcon,
        url: '/socials',
        isDesktop: true,
        isAnimated: false,
      },
      {
        id: 'wallet',
        title: i18n.t('Section.Wallet'),
        active: selected === 'wallet',
        icon: CreditCardIcon,
        url: '/wallet',
        isDesktop: true,
        isAnimated: false,
      },

      {
        id: 'settings',
        title: i18n.t('Section.Settings'),
        active: selected === 'settings',
        icon: CogIcon,
        url: '/settings',
        isDesktop: true,
        isAnimated: false,
      },
    ],
    [selected],
  );

  return menu;
};

export type MenuId = 'all' | 'timeline';

export type MenuDetail = {
  id: MenuId;
  title: string;
  active: boolean;
  icon: React.ReactNode;
  url: string;
  isDesktop: boolean;
  isAnimated: boolean;
  allowAnonymous: boolean;
};

export const useMenuList = (selected: MenuId): MenuDetail[] => {
  const menu: MenuDetail[] = useMemo(
    () => [
      {
        id: 'timeline',
        title: i18n.t('Experience.New.TimelineIFollow'),
        active: selected === 'timeline',
        icon: CustomFolderIcon,
        url: '/',
        isDesktop: true,
        isAnimated: false,
        allowAnonymous: false,
      },
      {
        id: 'all',
        title: i18n.t('Experience.New.AllOfMyriad'),
        active: selected === 'all',
        icon: GlobeAltIcon,
        url: '/all',
        isDesktop: true,
        isAnimated: false,
        allowAnonymous: true,
      },
    ],
    [selected],
  );

  return menu;
};
