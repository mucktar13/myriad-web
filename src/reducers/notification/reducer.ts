import { PaginationState as BasePaginationState } from '../base/state';
import { Actions } from './actions';
import * as constants from './constants';

import * as Redux from 'redux';
import { Notification } from 'src/interfaces/notification';

export interface NotificationState extends BasePaginationState {
  notifications: Notification[];
  total: number;
}

const initalState: NotificationState = {
  loading: false,
  total: 0,
  notifications: [],
  meta: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItemCount: 0,
    totalPageCount: 0,
  },
};

export const NotificationReducer: Redux.Reducer<NotificationState, Actions> = (
  state = initalState,
  action,
) => {
  switch (action.type) {
    case constants.FETCH_NOTIFICATION: {
      return {
        ...state,
        loading: false,
        notifications:
          !action.meta.currentPage || action.meta.currentPage === 1
            ? action.notifications
            : [...state.notifications, ...action.notifications],
        meta: action.meta,
      };
    }

    case constants.READ_NOTIFICATION: {
      return {
        ...state,
        notifications: state.notifications.map(notification => {
          if (notification.id === action.notificationId) {
            notification.read = true;
          }

          return notification;
        }),
      };
    }

    case constants.TOTAL_NEW_NOTIFICATION: {
      return {
        ...state,
        total: action.total,
      };
    }

    case constants.MARK_ALL_READ: {
      return {
        ...state,
        notifications: state.notifications.map(notification => {
          notification.read = true;

          return notification;
        }),
      };
    }

    case constants.CLEAR_NOTIFIACTION_COUNT: {
      return {
        ...state,
        total: 0,
      };
    }

    default: {
      return state;
    }
  }
};
