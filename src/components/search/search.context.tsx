import React, {createContext, useContext, useReducer} from 'react';

import {User} from 'src/interfaces/user';

export enum SearchTypeEnum {
  ALL = 'ALL',
  PEOPLE = 'PEOPLE',
  POS = 'POST',
}

export enum SearchActionType {
  LOAD_USER = 'USER_LOADED',
}

export interface LoadUser {
  type: SearchActionType.LOAD_USER;
  payload: User[];
}

export type Action = LoadUser;
type Dispatch = (action: Action) => void;
type SearchProviderProps = {children: React.ReactNode};
type State = {
  results: User[];
  type: SearchTypeEnum;
};

const initialState: State = {
  results: [],
  type: SearchTypeEnum.PEOPLE,
};

const SearchContext = createContext<{state: State; dispatch: Dispatch} | undefined>(undefined);

function searchReducer(state: State, action: Action) {
  switch (action.type) {
    case SearchActionType.LOAD_USER: {
      return {
        ...state,
        results: action.payload,
      };
    }
    default: {
      throw new Error(`Unhandled action type on searchReducer`);
    }
  }
}

export const useSearchContext = () => {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }

  return context;
};

export const SearchProvider = ({children}: SearchProviderProps) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {state, dispatch};

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};
