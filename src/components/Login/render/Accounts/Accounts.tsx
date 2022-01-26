import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';

import {Button, Grid, List, ListItem, ListItemAvatar, ListItemText} from '@material-ui/core';

import {InjectedAccountWithMeta} from '@polkadot/extension-inject/types';
import Identicon from '@polkadot/react-identicon';

import {useStyles} from './Accounts.style';

type AccountListProps = {
  onSelect: (account: InjectedAccountWithMeta) => void;
  onNext: (callback: () => void) => void;
  accounts: InjectedAccountWithMeta[];
  signature: boolean;
};

export const Accounts: React.FC<AccountListProps> = props => {
  const styles = useStyles();
  const navigate = useNavigate();

  const {accounts, onSelect, onNext, signature} = props;

  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (signature) {
      setSubmitted(false);
    }
  }, [signature]);

  const handleSelectAccount = (account: InjectedAccountWithMeta) => () => {
    onSelect(account);

    setSelectedAccount(account);
  };

  const handleBack = () => {
    navigate('/wallet');
  };

  const handleNext = () => {
    setSubmitted(true);

    onNext(() => {
      navigate('/profile');
    });
  };

  return (
    <div className={styles.root}>
      <List className={styles.list}>
        {accounts.map(account => {
          return (
            <ListItem
              selected={selectedAccount?.address === account.address}
              disableGutters
              onClick={handleSelectAccount(account)}
              key={account.address}
              className={styles.item}
              button>
              <ListItemAvatar>
                <Identicon value={account.address} size={48} theme="polkadot" />
              </ListItemAvatar>
              <ListItemText
                primary={account.meta.name}
                secondary={account.address}
                className={styles.accountDetail}
              />
            </ListItem>
          );
        })}
      </List>

      <Grid container justifyContent="space-between" style={{marginTop: 24}}>
        <Button
          disabled={submitted}
          variant="outlined"
          color="secondary"
          size="small"
          onClick={handleBack}>
          Back
        </Button>
        <Button
          disabled={selectedAccount === null || submitted}
          variant="contained"
          color="primary"
          size="small"
          onClick={handleNext}>
          Next
        </Button>
      </Grid>
    </div>
  );
};
