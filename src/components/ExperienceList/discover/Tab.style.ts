import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex: '1 1 auto',
      background: 'transparent',
      '& .MuiBox-root': {
        paddingTop: 0,
      },
      [theme.breakpoints.down('xs')]: {
        padding: '0px 20px',
      },
    },
    content: {
      padding: theme.spacing('24px', 3.75, 0),
      background: '#FFF',
      boxShadow: `0px 2px 10px rgba(0, 0, 0, 0.05)`,
      borderRadius: `20px`,
      [theme.breakpoints.down('xs')]: {
        borderRadius: `10px`,
      },
    },
    action: {
      fontWeight: 500,
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
      },
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        fontWeight: theme.typography.fontWeightMedium,
        justifyContent: 'flex-end',
      },
      paddingBottom: '20px',
    },
    title: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    box: {
      [theme.breakpoints.down('xs')]: {
        padding: '0px 20px',
      },
    },
    desktop: {
      marginBottom: 12,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    flex: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1.5),
      justifyContent: 'space-between',
    },
    info: {
      padding: 0,
      '& .MuiSvgIcon-root': {
        fill: 'none',
      },
    },
    formSearch: {
      marginBottom: 10,
    },
  }),
);
