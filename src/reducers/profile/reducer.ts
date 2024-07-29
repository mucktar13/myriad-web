import { HYDRATE } from 'next-redux-wrapper';

import { State as BaseState } from '../base/state';
import { Actions } from './actions';
import * as constants from './constants';

import * as Redux from 'redux';
import { UserExperience } from 'src/interfaces/experience';
import { Friend } from 'src/interfaces/friend';
import { SocialMedia } from 'src/interfaces/social';
import { FriendStatusProps, User } from 'src/interfaces/user';
import { PaginationParams } from 'src/lib/api/interfaces/pagination-params.interface';

export interface ProfileState extends BaseState {
  userId?: string;
  detail?: User & { friendInfo: FriendStatusProps };
  socials: SocialMedia[];
  friends: {
    filter?: string;
    params?: PaginationParams;
    data: Friend[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItemCount: number;
      totalPageCount: number;
    };
  };
  experience: {
    data: UserExperience[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItemCount: number;
      totalPageCount: number;
    };
  };
  friendStatus?: Friend;
}

const initalState: ProfileState = {
  loading: false,
  socials: [],
  friends: {
    data: [],
    meta: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItemCount: 0,
      totalPageCount: 0,
    },
  },
  experience: {
    data: [],
    meta: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItemCount: 0,
      totalPageCount: 0,
    },
  },
};

export const ProfileReducer: Redux.Reducer<ProfileState, Actions> = (
  state = initalState,
  action,
) => {
  switch (action.type) {
    case HYDRATE: {
      return action.payload.profileState;
    }

    case constants.FETCH_PROFILE_DETAIL: {
      return {
        ...state,
        detail: action.detail,
      };
    }

    case constants.FETCH_PROFILE_FRIEND: {
      if (!action.meta.currentPage || action.meta.currentPage === 1) {
        return {
          ...state,
          friends: {
            data: action.friends,
            meta: action.meta,
            filter: undefined,
          },
        };
      }

      return {
        ...state,
        friends: {
          data: [...state.friends.data, ...action.friends],
          meta: action.meta,
          filter: undefined,
        },
      };
    }

    case constants.FILTER_PROFILE_FRIEND: {
      return {
        ...state,
        friends: {
          data: action.friends,
          meta: action.meta,
          filter: action.query,
        },
      };
    }

    case constants.FETCH_PROFILE_SOCIALS: {
      return {
        ...state,
        socials: action.payload,
      };
    }

    case constants.FETCH_PROFILE_EXPERIENCE: {
      return {
        ...state,
        experience: {
          data: action.experiences,
          meta: action.meta,
        },
      };
    }

    case constants.SET_FRIENDED_STATUS: {
      return {
        ...state,
        friendStatus: action.status,
      };
    }

    case constants.SET_PROFILE_FRIENDS_FILTER: {
      return {
        ...state,
        friends: {
          ...state.friends,
          params: action.params,
        },
      };
    }

    case constants.CLEAR_FRIENDED_STATUS: {
      const tmpState = { ...state };
      delete tmpState.friendStatus;
      return tmpState;
    }

    default: {
      return state;
    }
  }
};
