import React from 'react';

import { useRouter } from 'next/router';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { useStyles } from '../Profile/Profile.style';

import {
  TopNavbarComponent,
  SectionTitle,
} from 'src/components/atoms/TopNavbar';
import Illustration from 'src/images/illustration/UserStatusIsometric.svg';

export const ProfileNotFound: React.FC = () => {
  const style = useStyles();

  const router = useRouter();

  const goHome = () => {
    router.push('/');
  };

  return (
    <div className={style.root}>
      <div className={style.mb}>
        <TopNavbarComponent
          description={'User not found'}
          sectionTitle={SectionTitle.PROFILE}
        />
      </div>
      <div className={style.emptyUser}>
        <div className={style.illustration}>
          <Illustration />
        </div>
        <Typography className={style.text}>
          We cannot find user you are looking for
        </Typography>
        <Typography className={style.text2}>
          This user might be blocked or banned from our system
        </Typography>
        <Button
          onClick={goHome}
          variant="contained"
          color="primary"
          size="medium">
          Back Home
        </Button>
      </div>
    </div>
  );
};
