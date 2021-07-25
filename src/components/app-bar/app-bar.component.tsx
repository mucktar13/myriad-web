import React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import {useTheme} from '@material-ui/core/styles';
import {fade, makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import LogoImageCompact from 'src/images/header-logo-compact.svg';
import LogoImage from 'src/images/header-logo.svg';

const SearchUserComponent = dynamic(() => import('../search/search.component'));
const DesktopMenuComponent = dynamic(() => import('./desktop-menu.component'));
const MobileMenuComponent = dynamic(() => import('./mobile-menu.component'));

interface HeaderProps {
  search?: string;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    logo: {
      display: 'flex',
      width: 327,
      margin: theme.spacing(0.5),
      [theme.breakpoints.down('sm')]: {
        width: 56,
      },
    },
    search: {
      position: 'relative',
      width: 678,
      backgroundColor: fade(theme.palette.primary.main, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.primary.main, 0.25),
      },
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(1),
        width: 288,
      },

      '& .MuiFormLabel-root': {
        color: '#5F5C5C',
      },
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
        justifyContent: 'space-around',
        width: 331,
      },
    },
  }),
);

const HeaderBar: React.FC<HeaderProps> = ({search}) => {
  const classes = useStyles();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.logo}>
            <Link href="/home">
              <a href="#top">{isMobile ? <LogoImageCompact /> : <LogoImage />}</a>
            </Link>
          </div>
          <div className={classes.grow} />
          <div className={classes.search}>
            <SearchUserComponent
              value={search}
              placeholder={isMobile ? 'Search Myria...' : 'Search for people or posts on Myriad...'}
            />
          </div>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop} id="user-menu">
            <DesktopMenuComponent />
          </div>
        </Toolbar>
      </AppBar>
      {isMobile && <MobileMenuComponent />}
    </div>
  );
};

export default HeaderBar;
