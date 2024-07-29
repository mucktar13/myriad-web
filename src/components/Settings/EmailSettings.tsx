/* eslint-disable jsx-a11y/interactive-supports-focus */

/* eslint-disable jsx-a11y/click-events-have-key-events */
import { XIcon } from '@heroicons/react/outline';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import getConfig from 'next/config';
import { useRouter } from 'next/router';

import {
  Button,
  TextField,
  Paper,
  IconButton,
  SvgIcon,
  Grid,
  CircularProgress,
} from '@material-ui/core';

import { useStyles } from './Settings.styles';

import { PromptComponent } from 'src/components/atoms/Prompt/prompt.component';
import { useUserHook } from 'src/hooks/use-user.hook';
import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import {
  sendVerificationEmail,
  updateEmail,
  deleteEmail,
} from 'src/reducers/config/actions';
import validator from 'validator';

const { publicRuntimeConfig } = getConfig();
const countDownTime = 60;

const EmailSetting = () => {
  const styles = useStyles();
  const { query, push } = useRouter();
  const dispatch = useDispatch();
  const loading = useSelector<RootState>(
    ({ configState: { loading } }) => loading,
  );
  const timeOutCountDown = useRef(null);
  const [emailValue, setEmail] = useState('');
  const [error, setError] = useState({
    isError: false,
    message: '',
  });
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [isWeb3AddEmailAddress, setIsWeb3AddEmailAddress] = useState(false);

  const { user, wallets } = useUserHook();
  const { email } = user;
  const isWeb2users = !wallets.length;
  const isWeb3UsersAndDontHaveEmail = wallets.length && !email;

  const { token, isDelete } = query;

  useEffect(() => {
    setEmail(email);
  }, [email]);

  useEffect(() => {
    if (countDown <= 0) {
      clearInterval(timeOutCountDown.current);
    }
    if (countDown === countDownTime) {
      timeOutCountDown.current = setInterval(() => {
        setCountDown(prev => prev - 1);
      }, 1000);
    }
  }, [countDown]);

  useEffect(() => {
    if (token && !isDelete) {
      dispatch(
        updateEmail(token, () => {
          push('/settings?section=email');
        }),
      );
    }
    if (token && isDelete) {
      dispatch(
        deleteEmail(token, () => {
          push('/settings?section=email');
        }),
      );
    }
  }, [dispatch, token, push, isDelete]);

  const onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;

    if (!input.length) {
      setError({ isError: false, message: '' });
    } else if (!validator.isEmail(input)) {
      setError({
        isError: true,
        message: 'Please enter a valid email!',
      });
    } else {
      setError({
        isError: false,
        message: '',
      });
    }
    setEmail(event.target.value);
  };

  const onClosePromptDialog = () => {
    setIsPromptDialogOpen(false);
    clearInterval(timeOutCountDown.current);
    setCountDown(0);
  };

  const openPromptDialogAndStartCountDown = () => {
    setCountDown(countDownTime);
    setIsPromptDialogOpen(true);
  };

  const web3UserAddEmailAddress = () => {
    setIsWeb3AddEmailAddress(true);
  };

  const onClickSendVerificationEMail = () => {
    dispatch(
      sendVerificationEmail(
        {
          email: emailValue,
          callbackURL:
            publicRuntimeConfig.appAuthURL + `/settings?section=email`,
        },
        openPromptDialogAndStartCountDown,
      ),
    );
  };

  const onDeleteEmail = () => {
    dispatch(
      sendVerificationEmail(
        {
          email: emailValue,
          callbackURL:
            publicRuntimeConfig.appAuthURL +
            `/settings?section=email&isDelete=true`,
        },
        openPromptDialogAndStartCountDown,
      ),
    );
  };

  if (loading)
    return (
      <Grid container justifyContent="center">
        <CircularProgress />
      </Grid>
    );

  return (
    <Paper elevation={0} className={styles.root}>
      <PromptComponent
        open={isPromptDialogOpen}
        icon="success"
        title="Your Verification Link Has Been Sent"
        subtitle={`We have sent you an email to the address ${emailValue} Check your inbox and click that link in order to ${
          isWeb3UsersAndDontHaveEmail ? 'verify' : 'remove'
        }  your email address.
Don’t forget to check your spam folder!`}
        onCancel={() => null}>
        <>
          <IconButton
            style={{
              color: 'black',
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            onClick={onClosePromptDialog}>
            <SvgIcon component={XIcon} viewBox="-0.8 -1 25 25" />
          </IconButton>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '48px',
              gap: '8px',
            }}>
            <Button
              variant="outlined"
              color="primary"
              disabled={countDown !== 0}
              onClick={
                isWeb3UsersAndDontHaveEmail
                  ? onClickSendVerificationEMail
                  : onDeleteEmail
              }>
              Resend verification email
            </Button>
            <span>
              You can send your verification link again in {countDown}s
            </span>
          </div>
        </>
      </PromptComponent>
      <div
        className={styles.option}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {isWeb3UsersAndDontHaveEmail && !isWeb3AddEmailAddress ? (
          <span
            role="button"
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6E3FC3',
              cursor: 'pointer',
            }}
            onClick={web3UserAddEmailAddress}>
            Add Email Address
          </span>
        ) : (
          <>
            <TextField
              variant="outlined"
              fullWidth
              label={i18n.t('Setting.List_Menu.Email_Address')}
              placeholder={i18n.t('Setting.List_Menu.Email_Placeholder')}
              value={emailValue}
              style={{ marginBottom: 'unset' }}
              onChange={onChangeEmail}
              disabled={isWeb2users || !isWeb3UsersAndDontHaveEmail}
              error={error.isError}
              helperText={error.isError ? error.message : ''}
            />
            <Button
              size="small"
              variant="contained"
              color="primary"
              style={{ marginLeft: '24px', marginRight: '17px' }}
              disabled={isWeb2users}
              onClick={
                isWeb3UsersAndDontHaveEmail
                  ? onClickSendVerificationEMail
                  : onDeleteEmail
              }>
              {isWeb3UsersAndDontHaveEmail ? 'Verify' : 'Remove'}
            </Button>
          </>
        )}
      </div>
    </Paper>
  );
};

export default EmailSetting;
