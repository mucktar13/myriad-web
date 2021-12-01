import React, {useState, useEffect} from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import {Transaction} from '../../interfaces/transaction';
import {
  historyAmountSortOptions,
  historyTransactionSortOptions,
  historyCoinSortOptions,
} from '../Timeline/default';
import {CustomAvatar, CustomAvatarSize} from '../atoms/Avatar';
import {MenuOptions} from '../atoms/DropdownMenu/';
import {DropdownMenu} from '../atoms/DropdownMenu/';
import {useStyles} from './history-detail-list.styles';

import {formatDistanceStrict} from 'date-fns';
import _ from 'lodash';
import {CurrencyId} from 'src/interfaces/currency';

type HistoryDetailListProps = {
  allTxs: Transaction[];
  outboundTxs: Transaction[];
  inboundTxs: Transaction[];
  isLoading: boolean;
  userId: string;
};

export const HistoryDetailList: React.FC<HistoryDetailListProps> = props => {
  const {allTxs, isLoading, inboundTxs, outboundTxs, userId} = props;

  useEffect(() => {
    const newArray = allTxs.map(tx => ({
      id: tx.currency.id,
      title: tx.currency.id,
    }));
    const updatedSortOptions = getUniqueListBy(newArray, 'id');

    //@ts-ignore
    setSortOptions((oldSortOptions: MenuOptions[]) => [...oldSortOptions, ...updatedSortOptions]);
  }, []);

  useEffect(() => {
    setDefaultTxs(allTxs);
  }, [allTxs]);

  const [sortOptions, setSortOptions] = useState(historyCoinSortOptions);

  const [defaultTxs, setDefaultTxs] = useState<Transaction[]>([]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const getUniqueListBy = (arr: Array<any>, key: string) => {
    return [...new Map(arr.map(item => [item[key], item])).values()];
  };

  const handleSortChange = (sort: string) => {
    switch (sort) {
      case 'highestAmount': {
        const sortedHighest = _.orderBy(defaultTxs, 'amount', 'desc');
        setDefaultTxs(sortedHighest);
        break;
      }

      case 'latestTransaction': {
        const sortedLatest = _.orderBy(defaultTxs, 'createdAt', 'desc');
        setDefaultTxs(sortedLatest);
        break;
      }

      default: {
        break;
      }
    }
  };

  const handleTransactionChange = (filterByTransactionDirection: string) => {
    switch (filterByTransactionDirection) {
      case 'received': {
        setDefaultTxs(inboundTxs);
        break;
      }

      case 'sent': {
        setDefaultTxs(outboundTxs);
        break;
      }

      default: {
        setDefaultTxs(allTxs);
        break;
      }
    }
  };

  const handleCurrencyChange = (filterByCurrency: string) => {
    switch (filterByCurrency) {
      case CurrencyId.ACA: {
        const filteredByACA = _.filter(allTxs, {currencyId: 'ACA'});
        setDefaultTxs(filteredByACA);
        break;
      }

      case CurrencyId.DOT: {
        const filteredByDOT = _.filter(allTxs, {currencyId: 'DOT'});
        setDefaultTxs(filteredByDOT);
        break;
      }

      case CurrencyId.AUSD: {
        const filteredByAUSD = _.filter(allTxs, {currencyId: 'AUSD'});
        setDefaultTxs(filteredByAUSD);
        break;
      }

      case CurrencyId.MYRIA: {
        const filteredByMYRIA = _.filter(allTxs, {currencyId: 'MYRIA'});
        setDefaultTxs(filteredByMYRIA);
        break;
      }

      default: {
        setDefaultTxs(allTxs);
        break;
      }
    }
  };

  const classes = useStyles();

  const formatTimeAgo = (ISODate: Date) => {
    const timeAgoInString = formatDistanceStrict(new Date(ISODate), new Date(), {addSuffix: true});
    //=> "3 days ago"
    return timeAgoInString;
  };

  const namePlaceholder = 'Unknown Myrian';

  return (
    <>
      <div className={classes.headerActionWrapper}>
        <DropdownMenu
          title={'Sort'}
          options={historyAmountSortOptions}
          onChange={handleSortChange}
        />
        <div className={classes.leftJustifiedWrapper}>
          <DropdownMenu title={'Coin'} options={sortOptions} onChange={handleCurrencyChange} />
          <DropdownMenu
            title={'Transaction'}
            options={historyTransactionSortOptions}
            onChange={handleTransactionChange}
          />
        </div>
      </div>
      <TableContainer component={List}>
        <Table className={classes.root} aria-label="history details table">
          <TableBody>
            {isLoading && defaultTxs.length === 0 && (
              <TableRow className={classes.loading}>
                <CircularProgress />
              </TableRow>
            )}
            {defaultTxs.length > 0 &&
              defaultTxs.map(tx => (
                <TableRow key={tx.id} className={classes.tableRow}>
                  <TableCell component="th" scope="row" className={classes.tableCell}>
                    <CustomAvatar
                      size={CustomAvatarSize.MEDIUM}
                      alt={tx.toUser?.id === userId ? tx.fromUser?.id : tx.toUser?.id}
                      avatar={
                        tx.toUser?.id === userId
                          ? tx.fromUser?.profilePictureURL ?? namePlaceholder
                          : tx.toUser?.profilePictureURL ?? namePlaceholder
                      }
                      name={
                        tx.toUser?.id === userId
                          ? tx.fromUser?.name ?? namePlaceholder
                          : tx.toUser?.name ?? namePlaceholder
                      }
                    />

                    <div>
                      <Typography variant="body1" style={{fontWeight: 'bold'}}>
                        {tx.toUser?.id === userId
                          ? tx.fromUser?.name ?? namePlaceholder
                          : tx.toUser?.name ?? namePlaceholder}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTimeAgo(tx.createdAt)}
                      </Typography>
                    </div>
                  </TableCell>

                  <TableCell align="center">
                    {tx.toUser?.id === userId && (
                      <div className={classes.tipStatusGreen}>
                        <Typography variant="caption">Tipped</Typography>
                      </div>
                    )}
                    {tx.fromUser?.id === userId && (
                      <div className={classes.tipStatusRed}>
                        <Typography variant="caption">Received</Typography>
                      </div>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <div className={classes.currencyDetailWrapper}>
                      <div>
                        {tx.toUser?.id === userId && (
                          <Typography variant="h5" className={classes.textAmountGreen}>
                            +{tx.amount} {tx.currency.id}
                          </Typography>
                        )}
                        {tx.fromUser?.id === userId && (
                          <Typography variant="h5" className={classes.textAmountRed}>
                            -{tx.amount} {tx.currency.id}
                          </Typography>
                        )}
                        <Typography variant="caption" color="textSecondary">
                          {'~15.25 USD'}
                        </Typography>
                      </div>
                      <div>
                        <CustomAvatar
                          name={tx.currency.id}
                          size={CustomAvatarSize.XSMALL}
                          alt={tx.currency.id}
                          avatar={tx.currency.image}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
