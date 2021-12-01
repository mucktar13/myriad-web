import React from 'react';
import {useSelector} from 'react-redux';

import {PrimaryCoinMenu} from '.';
import {UserState} from '../../reducers/user/reducer';

import {RootState} from 'src/reducers';
import {BalanceState} from 'src/reducers/balance/reducer';

type PrimaryCoinMenuContainer = {
  togglePrimaryCoinMenu: () => void;
};

export const PrimaryCoinMenuContainer: React.FC<PrimaryCoinMenuContainer> = props => {
  const {user} = useSelector<RootState, UserState>(state => state.userState);

  if (!user) return null;

  const {togglePrimaryCoinMenu} = props;

  const {balanceDetails} = useSelector<RootState, BalanceState>(state => state.balanceState);

  return (
    <PrimaryCoinMenu
      togglePrimaryCoinMenu={togglePrimaryCoinMenu}
      balanceDetails={balanceDetails}
      user={user}
    />
  );
};
