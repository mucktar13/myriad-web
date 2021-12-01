import {ChevronDownIcon} from '@heroicons/react/outline';
import {SearchIcon} from '@heroicons/react/solid';

import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
  Avatar,
  Button,
  IconButton,
  InputBase,
  List,
  MenuItem,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import Menu from '@material-ui/core/Menu';

import {formatUsd} from '../../helpers/balance';
import {Currency, CurrencyId} from '../../interfaces/currency';
import {Transaction, TransactionSort} from '../../interfaces/transaction';
import {DropdownMenu} from '../atoms/DropdownMenu';
import {ListItemComponent} from '../atoms/ListItem';
import {Modal, ModalProps} from '../atoms/Modal';
import {useStyles} from './TipHistory.styles';
import {sortOptions} from './default';

import {debounce} from 'lodash';
import {Empty} from 'src/components-v2/atoms/Empty';
import {Loading} from 'src/components-v2/atoms/Loading';
import ShowIf from 'src/components/common/show-if.component';

type TipHistoryProps = Pick<ModalProps, 'open' | 'onClose'> & {
  hasMore: boolean;
  tips: Transaction[];
  currencies: Currency[];
  sendTip: () => void;
  onSort: (sort: TransactionSort) => void;
  onFilter: (currency: CurrencyId) => void;
  nextPage: () => void;
};

export const TipHistory: React.FC<TipHistoryProps> = props => {
  const {tips, hasMore, currencies, open, onClose, sendTip, onSort, onFilter, nextPage} = props;

  const styles = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>('All Coin');

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilter = (currency: Currency) => () => {
    setSelected(currency.id);
    onFilter(currency.id);
    handleClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO FILTER WHEN TYPING
    setSearch(event.target.value);
    const debounceSubmit = debounce(() => {
      console.log(search);
    }, 300);

    debounceSubmit();
  };

  const submitSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // TODO FILTER WHEN ENTER
    if (event.key === 'Enter') {
      console.log(search);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortChange = (sort: string) => {
    onSort(sort as TransactionSort);
  };

  return (
    <Modal title="Tip History" open={open} onClose={onClose} className={styles.root}>
      <div className={styles.root}>
        <div className={styles.options}>
          <DropdownMenu title="Sort by" options={sortOptions} onChange={handleSortChange} />

          <div>
            <Typography component="span">Coin:&nbsp;</Typography>

            <Typography component="span" color="textPrimary" className={styles.selected}>
              {selected}
            </Typography>

            <IconButton
              className={styles.expand}
              onClick={handleClick}
              color="primary"
              aria-label="expand">
              <SvgIcon component={ChevronDownIcon} fontSize="small" color="primary" />
            </IconButton>

            <Menu
              id="currency-option"
              classes={{
                paper: styles.menu,
              }}
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
              transformOrigin={{vertical: 'top', horizontal: 'center'}}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              <div>
                <InputBase
                  className={styles.search}
                  onKeyUp={submitSearch}
                  value={search}
                  onChange={handleChange}
                  placeholder={`Search Coin`}
                  inputProps={{
                    'aria-label': 'search',
                  }}
                  startAdornment={<SvgIcon component={SearchIcon} fontSize="small" />}
                />

                {currencies.map(currency => (
                  <MenuItem
                    key={currency.id}
                    onClick={handleFilter(currency)}
                    className={styles.item}>
                    <ListItemComponent size="tiny" title={currency.id} avatar={currency.image} />
                  </MenuItem>
                ))}
              </div>
            </Menu>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        <ShowIf condition={tips.length === 0}>
          <Empty title="Tip empty" subtitle="" />
        </ShowIf>

        <List className={styles.list} id="scrollable-tip-history">
          <InfiniteScroll
            scrollableTarget="scrollable-tip-history"
            dataLength={tips.length}
            hasMore={hasMore}
            next={nextPage}
            loader={<Loading />}>
            {tips.map(tip => (
              <ListItemComponent
                key={tip.id}
                avatar={tip.fromUser.profilePictureURL || tip.fromUser.name}
                title={tip.fromUser.name}
                subtitle={'2 seconds ago'}
                size="medium"
                action={
                  <div className={styles.tip}>
                    <div>
                      <Typography variant="h5">
                        {tip.amount} {tip.currencyId}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ~{formatUsd(tip.amount, tip.currency)} USD
                      </Typography>
                    </div>
                    <Avatar src={tip.currency.image} className={styles.logo} />
                  </div>
                }
              />
            ))}
          </InfiniteScroll>
        </List>
      </div>

      <div className={styles.action}>
        <Button variant="contained" color="primary" disableElevation fullWidth onClick={sendTip}>
          I want to send tip too
        </Button>
      </div>
    </Modal>
  );
};
