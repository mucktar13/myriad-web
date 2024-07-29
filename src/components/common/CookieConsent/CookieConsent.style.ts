import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    paper: {
      [theme.breakpoints.down('xs')]: {
        width: '65vw',
        height: 'auto',
        bottom: '-5vh',
        padding: '5%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'fixed',
        right: '-5%',
      },
      width: 560,
      height: 120,
      padding: 40,
      background: '#FFF2CC',
      display: 'flex',
      flexWrap: 'nowrap',
      flexDirection: 'row',
      borderRadius: 10,
      left: 'auto',
      marginBottom: 60,
      marginRight: 60,
      borderTop: 'none',
    },
    term: {
      color: '#0A0A0A',
    },
    link: {
      textDecoration: 'none',
    },
  }),
);
