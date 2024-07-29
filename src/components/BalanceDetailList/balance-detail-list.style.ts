import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      paddingLeft: 0,
    },
    tableRow: {
      '& .MuiTableCell-root': {
        borderBottom: 'none',
        paddingRight: 0,
        paddingTop: theme.spacing(1.25),
        paddingBottom: theme.spacing(1.25),
      },
    },
    tableCell: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      columnGap: theme.spacing(2.5),
      borderBottom: 'none',
      paddingLeft: 0,
      paddingRight: 0,
    },
    headerActionWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    refreshIcon: {
      paddingRight: 0,
      '& .MuiSvgIcon-root': {
        fill: 'none',
        paddingRight: theme.spacing(1),
      },
      '&:hover': {
        background: 'none',
      },
      fontSize: 13,
      marginLeft: 'auto',
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 360,
    },
    search: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    fill: {
      '& .MuiSvgIcon-root': {
        fill: 'currentColor',
      },
    },
    formControl: {
      marginRight: '0px',
      [theme.breakpoints.down('xs')]: {},
      '& .MuiTypography-body1': {
        width: '120px',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      },
    },
    menu: {
      maxWidth: 'max-content',
    },
  }),
);
