import React from 'react';
import { useSelector } from 'react-redux';

import getConfig from 'next/config';

import { AccountSettingsContainer } from '../AccountSettingsContainer';
import EmailSettings from '../EmailSettings';
import { LanguageSettingsContainer } from '../LanguageSettingsContainer';
import { NotificationSettingsContainer } from '../NotificationSettings.container';
import SharingSetting from '../SharingSettings';
import { BlockListContainer } from '../render/BlockList';
import { HelpComponent } from '../render/Help';

import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import { UserState } from 'src/reducers/user/reducer';

const { publicRuntimeConfig } = getConfig();

export type SettingsType =
  | 'account'
  | 'notification'
  | 'email'
  | 'sharing'
  | 'block'
  | 'language'
  | 'about'
  | 'feedback'
  | 'help'
  | 'version';

export type SettingsOption<T> = {
  id: T;
  title: string;
  subtitle?: string;
  component?: React.ReactNode;
};

export const useSettingList = (): SettingsOption<SettingsType>[] => {
  const { anonymous } = useSelector<RootState, UserState>(
    state => state.userState,
  );

  const panel: SettingsOption<SettingsType>[] = [
    {
      id: 'language',
      title: i18n.t('Setting.List_Menu.Language_Title'),
      subtitle: i18n.t('Setting.List_Menu.Language_Subtitle'),
      component: <LanguageSettingsContainer />,
    },
    {
      id: 'help',
      title: i18n.t('Setting.List_Menu.Help_Title'),
      subtitle: i18n.t('Setting.List_Menu.Help_Subtitle'),
      component: (
        <HelpComponent support={publicRuntimeConfig.myriadSupportMail} />
      ),
    },
    {
      id: 'about',
      title: i18n.t('Setting.List_Menu.About_Title'),
      subtitle: i18n.t('Setting.List_Menu.About_Subtitle'),
    },
    {
      id: 'feedback',
      title: i18n.t('Setting.List_Menu.Feedback_Title'),
      subtitle: i18n.t('Setting.List_Menu.Feedback_Subtitle'),
    },
    {
      id: 'version',
      title: i18n.t('Setting.List_Menu.Version_Title'),
    },
  ];

  if (!anonymous) {
    panel.unshift(
      {
        id: 'account',
        title: i18n.t('Setting.List_Menu.Account_Title'),
        subtitle: i18n.t('Setting.List_Menu.Account_Subtitle'),
        component: <AccountSettingsContainer />,
      },
      {
        id: 'email',
        title: i18n.t('Setting.List_Menu.Email_Title'),
        subtitle: i18n.t('Setting.List_Menu.Email_Subtitle'),
        component: <EmailSettings />,
      },
      {
        id: 'notification',
        title: i18n.t('Setting.List_Menu.Notification_Title'),
        subtitle: i18n.t('Setting.List_Menu.Notification_Subtitle'),
        component: <NotificationSettingsContainer />,
      },
      {
        id: 'sharing',
        title: i18n.t('Setting.List_Menu.Sharing_Title'),
        subtitle: i18n.t('Setting.List_Menu.Sharing_Subtitle'),
        component: <SharingSetting />,
      },
      {
        id: 'block',
        title: i18n.t('Setting.List_Menu.Blocked_Title'),
        subtitle: i18n.t('Setting.List_Menu.Blocked_Subtitle'),
        component: <BlockListContainer />,
      },
    );
  }

  return panel;
};
