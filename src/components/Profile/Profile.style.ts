import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 1024,
      background: theme.palette.background.default,
      overflow: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      scrollbarColor: 'transparent transparent',
      '& ::-webkit-scrollbar': {
        display: 'none',
        width: '0 !important',
      },
    },
    mb: {
      marginBottom: '10px',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
      },
    },
    scroll: {
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    emptyUser: {
      textAlign: 'center',
      background: '#FFF',
      borderRadius: 20,
      height: 644,
      padding: 30,

      [theme.breakpoints.down('md')]: {
        minWidth: 590,
      },
    },
    text: {
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1,
    },
    text2: {
      marginBottom: '85px',
      fontSize: '20px',
      lineHeight: 1,
    },
    illustration: {
      marginBottom: '80px',
      marginTop: '70px',
    },
    blocked: {
      background: 'white',
      textAlign: 'center',
      height: 'calc(100vh - 400px)',
      marginTop: 20,
      padding: 20,
    },
    blockedTitle: {
      fontWeight: 700,
      marginBottom: 20,
    },
  }),
);
