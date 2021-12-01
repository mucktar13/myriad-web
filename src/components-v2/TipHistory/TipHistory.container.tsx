import React from 'react';

import {TipHistory} from './TipHistory';

import {useTipHistory} from 'src/hooks/tip-history.hook';
import {Comment} from 'src/interfaces/comment';
import {Post} from 'src/interfaces/post';

type TipHistoryContainerProps = {
  onSendTip: (reference: Post | Comment) => void;
};

export const TipHistoryContainer: React.FC<TipHistoryContainerProps> = props => {
  const {onSendTip} = props;

  const {
    isTipHistoryOpen,
    hasMore,
    reference,
    currencies,
    transactions,
    closeTipHistory,
    handleFilterTransaction,
    handleSortTransaction,
    handleLoadNextPage,
  } = useTipHistory();

  const handleSendTip = () => {
    if (reference) {
      onSendTip(reference);
    }

    closeTipHistory();
  };

  return (
    <TipHistory
      open={isTipHistoryOpen}
      hasMore={hasMore}
      currencies={currencies}
      tips={transactions}
      sendTip={handleSendTip}
      onClose={closeTipHistory}
      onSort={handleSortTransaction}
      onFilter={handleFilterTransaction}
      nextPage={handleLoadNextPage}
    />
  );
};
