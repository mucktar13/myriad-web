import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      [theme.breakpoints.down('xs')]: {
        padding: '0px 20px',
      },
    },
    mb: {
      marginBottom: 10,
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

      [theme.breakpoints.down('xs')]: {
        minWidth: 0,
        borderRadius: 10,
      },
    },
    text: {
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1,
      [theme.breakpoints.down('xs')]: {
        fontSize: '18px',
        fontWeight: 600,
      },
    },
    text2: {
      marginBottom: '85px',
      fontSize: '20px',
      lineHeight: 1,
      [theme.breakpoints.down('xs')]: {
        fontSize: '14px',
      },
    },
    illustration: {
      marginBottom: '80px',
      marginTop: '70px',
    },
  }),
);
