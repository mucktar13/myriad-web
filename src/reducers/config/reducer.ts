import getConfig from 'next/config';

import { State as BaseState } from '../base/state';
import { Actions } from './actions';
import * as constants from './constants';

import * as Redux from 'redux';
import { Currency } from 'src/interfaces/currency';
import { UserSettings } from 'src/interfaces/setting';

const { publicRuntimeConfig } = getConfig();

export interface ConfigState extends BaseState {
  availableCurrencies: Currency[];
  filteredCurrencies: Currency[];
  layout: {
    mobile: boolean;
    focus: boolean;
  };
  settings: UserSettings;
}

const initalState: ConfigState = {
  loading: false,
  availableCurrencies: [],
  filteredCurrencies: [],
  layout: {
    mobile: false,
    focus: false,
  },
  settings: {
    version: publicRuntimeConfig.appVersion,
    privacy: {
      accountPrivacy: 'public',
      socialMediaPrivacy: 'public',
    },
    notification: {
      comments: true,
      tips: true,
      mentions: true,
      friendRequests: true,
      followers: true,
      upvotes: true,
    },
    language: 'en',
  },
};

export const ConfigReducer: Redux.Reducer<ConfigState, Actions> = (
  state = initalState,
  action,
) => {
  switch (action.type) {
    case constants.FETCH_AVAILABLE_TOKEN: {
      return {
        ...state,
        availableCurrencies: action.payload,
      };
    }

    case constants.FETCH_FILTERED_TOKEN: {
      return {
        ...state,
        filteredCurrencies: action.payload,
      };
    }

    case constants.FETCH_PRIVACY_SETTING: {
      return {
        ...state,
        settings: {
          ...state.settings,
          privacy: action.settings,
        },
      };
    }

    case constants.UPDATE_NOTIFICATION_SETTING: {
      return {
        ...state,
        settings: {
          ...state.settings,
          notification: action.settings,
        },
      };
    }

    case constants.SET_LANGUAGE_SETTING: {
      return {
        ...state,
        settings: {
          ...state.settings,
          language: action.lang,
        },
      };
    }

    case constants.SET_LOADING_CONFIG: {
      return {
        ...state,
        loading: action.payload,
      };
    }

    default: {
      return state;
    }
  }
};
