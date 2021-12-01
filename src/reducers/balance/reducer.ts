import {HYDRATE} from 'next-redux-wrapper';

import * as BaseConstants from '../base/constants';
import {State as BaseState} from '../base/state';
import {Actions} from './actions';
import * as constants from './constants';

import update from 'immutability-helper';
import * as Redux from 'redux';
import {BalanceDetail} from 'src/interfaces/balance';

export interface BalanceState extends BaseState {
  balanceDetails: BalanceDetail[];
}

const initialState: BalanceState = {
  loading: false,
  balanceDetails: [],
};

export const BalanceReducer: Redux.Reducer<BalanceState, Actions> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case HYDRATE: {
      return action.payload.balanceState;
    }

    case constants.FETCH_BALANCES: {
      return {
        ...state,
        balanceDetails: action.balanceDetails,
      };
    }

    case BaseConstants.ACTION_LOADING: {
      return update(state, {
        loading: {$set: action.loading},
      });
    }

    default: {
      return state;
    }
  }
};
