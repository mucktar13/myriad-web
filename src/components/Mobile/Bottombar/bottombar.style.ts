import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'fixed',
      bottom: 0,
      zIndex: 98,
      display: 'none',
      boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
        width: '100%',
        background: '#FFF',
        height: '56px',
        padding: theme.spacing(0, 2.5),
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      },
    },
    buttonCreate: {
      position: 'fixed',
      cursor: 'pointer',
      zIndex: 99,
      bottom: 59,
      right: 7,
    },
    iconbuttonCreate: {
      backgroundColor: '#862AE9',
      width: '40px',
      height: '40px',
      '&:hover': {
        backgroundColor: '#862AE9',
        opacity: 0.8,
      },
    },
    popoverbuttonCreate: {
      backgroundColor: '#862AE9',
      position: 'absolute',
      bottom: 100,
      right: 7,
      width: '40px',
      height: '40px',
      '&:hover': {
        backgroundColor: '#862AE9',
        opacity: 0.8,
      },
    },
    popoverbuttonImport: {
      backgroundColor: '#862AE9',
      position: 'absolute',
      bottom: 142,
      right: 7,
      width: '40px',
      height: '40px',
      '&:hover': {
        backgroundColor: '#862AE9',
        opacity: 0.8,
      },
    },
    popover: {
      position: 'relative',
      top: -40,
    },
    fillButtonCreate: {
      color: '#fff',
    },
    icon: {
      color: '#404040',
      marginRight: theme.spacing(1),
    },
    button: {
      cursor: 'pointer',
      zIndex: 99,
    },
    iconbutton: {
      width: '34px',
      height: '34px',
      padding: '4px !important',
      color: '#000',
    },
    fill: {
      color: '#000',
    },
    active: {
      width: '34px',
      height: '34px',
      padding: '4px !important',
      color: '#FFF',
      backgroundColor: '#862AE9 !important',
    },
  }),
);
