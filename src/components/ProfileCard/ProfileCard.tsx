import React, { useState } from 'react';

import dynamic from 'next/dynamic';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

import { Skeleton as NetworkSkeleton } from './Network.skeleton';
import { ProfileCardProps } from './ProfileCard.interfaces';
import { useStyles } from './ProfileCard.style';
import { ProfileContent } from './index';

import SelectServer from 'components/SelectServer';
import { CommonWalletIcon } from 'components/atoms/Icons';
import useBlockchain from 'components/common/Blockchain/use-blockchain.hook';
import { useEnqueueSnackbar } from 'components/common/Snackbar/useEnqueueSnackbar.hook';
import ShowIf from 'src/components/common/show-if.component';
import { formatAddress } from 'src/helpers/wallet';
import { useInstances } from 'src/hooks/use-instances.hooks';
import { ServerListProps } from 'src/interfaces/server-list';
import i18n from 'src/locale';

const NetworkOption = dynamic(() => import('./NetworkOption/NetworkOption'), {
  ssr: false,
});

export const ProfileCard: React.FC<ProfileCardProps> = props => {
  const {
    user,
    anonymous = false,
    wallets,
    alias,
    notificationCount,
    handleConnectWeb3Wallet,
    handleSignOut,
    handleLoginOrCreateAccount,
    onViewProfile,
    onShowNotificationList,
    currentWallet,
    networks,
    userWalletAddress,
  } = props;

  const { loadingBlockchain: loading } = useBlockchain();
  const classes = useStyles();

  const enqueueSnackbar = useEnqueueSnackbar();

  const { switchInstance, onLoadingSwitch } = useInstances();
  const [register, setRegister] = useState(false);

  const handleSwitchInstance = async (
    server: ServerListProps,
    callback?: () => void,
  ) => {
    try {
      await switchInstance(server);

      callback && callback();
    } catch (err) {
      if (err.message === 'AccountNotFound') {
        setRegister(true);
      } else {
        enqueueSnackbar({ message: err.message, variant: 'error' });
      }

      onLoadingSwitch(false);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.box}>
        <ProfileContent
          user={user}
          anonymous={anonymous}
          currentWallet={currentWallet}
          alias={alias}
          networks={networks}
          notificationCount={notificationCount}
          onShowNotificationList={onShowNotificationList}
          onViewProfile={onViewProfile}
          handleSignOut={handleSignOut}
          userWalletAddress={userWalletAddress}
        />
        <div className={classes.wallet}>
          <ShowIf condition={anonymous}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLoginOrCreateAccount}>
              Sign in or Create an Account
            </Button>
          </ShowIf>
          <ShowIf condition={!anonymous && !user?.fullAccess}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnectWeb3Wallet}>
              <CommonWalletIcon viewBox="1 -3.5 20 20" />
              <span style={{ paddingLeft: '5px' }}>Connect Web 3.0 wallet</span>
            </Button>
          </ShowIf>
          <ShowIf condition={!anonymous && user?.fullAccess}>
            <ShowIf condition={Boolean(currentWallet)}>
              <NetworkOption
                currentWallet={currentWallet}
                wallets={wallets}
                networks={networks}
              />
              <Typography component="div" className={classes.address}>
                <ShowIf condition={loading}>
                  <Skeleton variant="text" height={20} />
                </ShowIf>
                <ShowIf condition={!loading}>
                  {formatAddress(currentWallet, userWalletAddress)}
                </ShowIf>
              </Typography>
            </ShowIf>
            <ShowIf condition={!currentWallet}>
              <NetworkSkeleton />
            </ShowIf>
          </ShowIf>
        </div>
        <div className={classes.instance}>
          <SelectServer
            title={i18n.t('Login.Options.Prompt_Select_Instance.Switch')}
            onSwitchInstance={handleSwitchInstance}
            register={register}
            setRegister={value => setRegister(value)}
            page="layout"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
