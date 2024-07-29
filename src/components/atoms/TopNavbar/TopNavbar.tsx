import { ChevronLeftIcon } from '@heroicons/react/outline';

import React from 'react';

import { useRouter } from 'next/router';

import { Grid, IconButton } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';

import { TopNavbarProps } from './TopNavbar.interfaces';
import { useStyles } from './TopNavbar.styles';

export const TopNavbarComponent: React.FC<TopNavbarProps> = props => {
  const {
    sectionTitle,
    description,
    reverse = false,
    type = 'back',
    onClick,
  } = props;

  const router = useRouter();
  const classes = useStyles({ ...props, type });

  const handleClick = (): void => {
    if (onClick) {
      onClick();
    } else {
      const section = router.query.section as string | undefined;
      const settings = [
        'account',
        'notification',
        'block',
        'language',
        'about',
        'feedback',
        'help',
        'version',
      ];

      if (
        router.pathname === '/settings' &&
        section &&
        settings.includes(section)
      ) {
        router.push('/settings', undefined, { shallow: true });
      } else {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push('/', undefined, { shallow: true });
        }
      }
    }
  };

  return (
    <Paper className={classes.root}>
      <IconButton
        color="primary"
        size="medium"
        disableRipple
        onClick={handleClick}
        className={classes.icon}>
        <SvgIcon component={ChevronLeftIcon} viewBox="0 0 24 24" />
      </IconButton>

      <div className={classes.drawer}>
        <SvgIcon
          component={ChevronLeftIcon}
          viewBox="0 0 24 24"
          onClick={() => router.back()}
        />
      </div>

      <Grid container direction={reverse ? 'column-reverse' : 'column'}>
        <Typography className={classes.title} color="primary">
          {sectionTitle}
        </Typography>
        <Typography className={classes.description}>{description}</Typography>
      </Grid>
    </Paper>
  );
};
