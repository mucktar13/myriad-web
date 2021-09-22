import {RefreshIcon} from '@heroicons/react/outline';

import React, {useState} from 'react';

import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import SvgIcon from '@material-ui/core/SvgIcon';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import {createStyles, Theme, makeStyles} from '@material-ui/core/styles';

import {BalanceDetail} from '../MyWallet/MyWallet';
import {PrimaryCoinMenu} from '../PrimaryCoinMenu/PrimaryCoinMenu';
import {balanceSortOptions} from '../Timeline/default';
import {DropdownMenu} from '../atoms/DropdownMenu/';
import {Button, ButtonVariant, ButtonColor} from '../atoms/button/';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      paddingLeft: 0,
    },
    tableRow: {
      '& .MuiTableCell-root': {
        borderBottom: 'none',
        paddingRight: 0,
        paddingTop: theme.spacing(1.25),
        paddingBottom: theme.spacing(1.25),
      },
    },
    tableCell: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      columnGap: theme.spacing(2.5),
      borderBottom: 'none',
      paddingLeft: 0,
      paddingRight: 0,
    },
    headerActionWrapper: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: theme.spacing(1),
    },
    refreshIcon: {
      paddingRight: 0,
      '& .MuiSvgIcon-root': {
        fill: 'none',
        paddingRight: theme.spacing(1),
      },
      '&:hover': {
        background: 'none',
      },
      fontSize: 13,
      marginLeft: 'auto',
    },
    balanceTabActions: {
      display: 'flex',
      justifyContent: 'space-between',
      columnGap: theme.spacing(2.875),
    },
  }),
);

type BalanceDetailListProps = {
  balanceDetails: BalanceDetail[];
};

export const BalanceDetailList: React.FC<BalanceDetailListProps> = props => {
  const {balanceDetails} = props;

  const [isOnPrimaryCoinMenu, setIsOnPrimaryCoinMenu] = useState(false);

  const handleRefresh = () => {
    console.log('refreshed!');
  };

  const togglePrimaryCoinMenu = () => {
    setIsOnPrimaryCoinMenu(!isOnPrimaryCoinMenu);
  };

  const classes = useStyles();

  if (isOnPrimaryCoinMenu)
    return (
      <>
        <PrimaryCoinMenu
          togglePrimaryCoinMenu={togglePrimaryCoinMenu}
          balanceDetails={balanceDetails}
        />
      </>
    );

  return (
    <>
      <div className={classes.headerActionWrapper}>
        <DropdownMenu title={'Sort'} options={balanceSortOptions} />
        <IconButton
          classes={{
            root: classes.refreshIcon,
          }}
          disableRipple
          aria-label="refresh"
          onClick={handleRefresh}>
          <SvgIcon component={RefreshIcon} color="primary" />
          <Typography variant="body1" color="primary">
            Refresh
          </Typography>
        </IconButton>
      </div>
      <TableContainer component={List}>
        <Table className={classes.root} aria-label="Balance Detail Table">
          <TableBody>
            {balanceDetails.map(balanceDetail => (
              <TableRow key={balanceDetail.id} className={classes.tableRow}>
                <TableCell component="th" scope="row" className={classes.tableCell}>
                  <Avatar alt={balanceDetail.name} src={balanceDetail.image} />
                  <Typography variant="h5" color="textPrimary">
                    {balanceDetail.id}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <div>
                    <Typography variant="body1" style={{fontWeight: 'bold'}}>
                      {balanceDetail.freeBalance}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {'USD 15.25'}
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className={classes.balanceTabActions}>
        <Button
          variant={ButtonVariant.OUTLINED}
          color={ButtonColor.SECONDARY}
          onClick={togglePrimaryCoinMenu}>
          Set coin priority
        </Button>
        <Button variant={ButtonVariant.CONTAINED}>+ Add coin</Button>
      </div>
    </>
  );
};