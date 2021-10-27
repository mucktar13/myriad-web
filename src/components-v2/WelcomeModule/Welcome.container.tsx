import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {useRouter} from 'next/router';

import {Button, Grid} from '@material-ui/core';

import {PromptComponent} from '../atoms/Prompt/prompt.component';
import {WelcomeModule} from './WelcomeModule';

import {RootState} from 'src/reducers';
import {updateUser} from 'src/reducers/user/actions';
import {UserState} from 'src/reducers/user/reducer';

type WelcomeProps = {
  enabled?: boolean;
};

export const WelcomeContainer: React.FC<WelcomeProps> = props => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {user} = useSelector<RootState, UserState>(state => state.userState);
  const [skip, setSkip] = useState(false);

  const openSkipConfirmation = () => {
    setSkip(true);
  };

  const closeSkipConfirmation = (): void => {
    setSkip(false);
  };

  const confirmSkip = () => {
    router.push('/home');
  };

  const handleSubmit = (displayname: string, username: string) => {
    dispatch(
      updateUser({
        name: displayname,
        username,
      }),
    );

    router.push('/home');
  };

  if (!user) return null;

  return (
    <>
      <WelcomeModule
        displayName={user.name}
        username={user.username || ''}
        onSkip={openSkipConfirmation}
        onSubmit={handleSubmit}
      />

      <PromptComponent
        title={'Are you sure?'}
        subtitle={`Are You really want to skip this process?
        and create username latter? `}
        open={skip}
        icon="warning"
        onCancel={closeSkipConfirmation}>
        <Grid container justifyContent="space-between">
          <Button size="small" variant="outlined" color="secondary" onClick={closeSkipConfirmation}>
            No, let me rethink
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={confirmSkip}>
            Yes, Let’s go
          </Button>
        </Grid>
      </PromptComponent>
    </>
  );
};
