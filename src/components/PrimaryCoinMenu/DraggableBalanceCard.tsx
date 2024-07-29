import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { useStyles } from '.';
import { Avatar, AvatarSize } from '../atoms/Avatar';
import { DragIndicatorIcon, ArrowUpIcon } from '../atoms/Icons';

import { formatUsd } from 'src/helpers/balance';
import { useExchangeRate } from 'src/hooks/use-exchange-rate.hook';
import { BalanceDetail } from 'src/interfaces/balance';

type DraggableBalanceCardProps = {
  balanceDetail: BalanceDetail;
  index: number;
  onClick: (index: number) => void;
};

export const DraggableBalanceCard: React.FC<DraggableBalanceCardProps> =
  props => {
    const { balanceDetail, index, onClick } = props;
    const classes = useStyles();

    const { loading, exchangeRates } = useExchangeRate();

    const getConversion = (currencyId: string) => {
      if (loading) {
        return 0;
      }

      const found = exchangeRates.find(
        exchangeRate => exchangeRate.id === currencyId,
      );

      if (found) return found.price;
      return 0;
    };

    const handleOnClick = () => {
      onClick(index);
    };

    return (
      <Card className={classes.cardRoot}>
        <CardContent>
          <div className={classes.cardContentWrapper}>
            <div className={classes.leftJustifiedWrapper}>
              <Avatar
                size={AvatarSize.MEDIUM}
                alt={balanceDetail.name ?? 'Coin'}
                src={balanceDetail.image}
              />
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                {balanceDetail.symbol.toUpperCase()}
              </Typography>
            </div>

            <div className={classes.rightJustifiedWrapper}>
              <div style={{ textAlign: 'right' }}>
                <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                  {parseFloat(balanceDetail.freeBalance.toFixed(4))}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ fontSize: 12 }}>
                  {`~${formatUsd(
                    balanceDetail.freeBalance,
                    getConversion(balanceDetail.id),
                  )} USD`}
                </Typography>
              </div>

              <ArrowUpIcon
                style={
                  index === 0
                    ? { transform: 'rotate(180deg)' }
                    : { transform: 'rotate(0deg)' }
                }
                className={classes.cursor}
                onClick={handleOnClick}
                viewBox="0 0 20 20"
              />

              <DragIndicatorIcon viewBox="0 0 18 20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
