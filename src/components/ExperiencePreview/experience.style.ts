import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 30,
      background: '#FFF',
      borderRadius: 10,
      [theme.breakpoints.down('xs')]: {
        padding: 20,
      },
    },
    avatar: {
      width: '100px',
      height: '100px',
    },
    photo: {
      width: '48px',
      height: '48px',
      marginRight: '20px',
    },
    experienceTopSummary: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      width: '100%',
    },
    experienceSummary: {
      marginLeft: '24px',
    },
    experienceName: {
      fontSize: '18px',
      fontWeight: 700,
      wordBreak: 'break-all',
      lineHeight: '25.2px',
      marginBottom: '8px',
    },
    experienceCounterMetric: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    wrapperCounter: {
      display: 'flex',
      marginRight: '8px',
    },
    counterNumberMetric: {
      fontWeight: 600,
    },
    counterTextMetric: {
      fontWeight: 400,
      color: '#757575',
    },
    subtitleContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    subtitle: {
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '12px',
    },
    tagSection: {
      fontSize: '14px',
      fontWeight: 400,
      marginTop: '4px',
    },
    mb30: {
      marginBottom: '30px',
    },
    description: {
      fontSize: '14px',
      color: theme.palette.text.secondary,
      wordBreak: 'break-all',
      marginTop: '24px',
      marginBottom: '24px',
    },
    allowedTag: {
      fontSize: '14px',
      fontWeight: 600,
      marginRight: '12px',
      color: theme.palette.primary.main,
      display: 'inline-block',
      wordBreak: 'break-all',
      marginBottom: '16px',
      lineHeight: '19.6px',
    },
    prohibitedTag: {
      fontSize: '14px',
      fontWeight: 600,
      marginRight: '12px',
      color: theme.palette.secondary.main,
      display: 'inline-block',
      wordBreak: 'break-all',
      marginBottom: '16px',
      lineHeight: '19.6px',
    },
    user: {
      fontSize: '16px',
    },
    secondaryText: {
      fontSize: '12px',
      fontWeight: 600,
    },
    flex: {
      display: 'flex',
      alignItems: 'center',
    },
    list: {
      padding: 0,
    },
    button: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '8px',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    mobileButton: {
      display: 'none',
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 8,
      },
    },
    actionButton: {
      width: '200px',
      marginRight: theme.spacing(1.5),
      [theme.breakpoints.down('xs')]: {
        marginRight: 0,
        marginBottom: theme.spacing(1.5),
        width: 'calc(50% - 4px)',
        maxWidth: '143.5px',
      },
    },
    editButton: {
      marginTop: '8px',
      width: '240px',
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    mobileEditButton: {
      display: 'none',
      marginBottom: theme.spacing(2),
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
        maxWidth: '295px',
      },
    },
    box: {
      [theme.breakpoints.down('xs')]: {
        padding: '0px 20px 20px 20px',
      },
    },
    chevron: {
      padding: 0,
    },
    postTextContainer: {
      border: '1px solid #E5E5E5',
      width: '100%',
      padding: '20px',
      borderRadius: '5px',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: 36,
    },
    textPost: {
      fontWeight: 600,
      fontSize: 18,
    },
    textPostDetail: {
      fontWeight: 400,
      fontSize: 14,
      marginTop: 9,
    },
    action: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 51,
      [theme.breakpoints.down('xs')]: {
        marginTop: 32,
      },
    },
    customVisibility: {
      maxHeight: '300px',
      overflowY: 'scroll',
      border: '1px solid #FFD24D',
      borderRadius: '4px',
      padding: '0 10px',
    },
  }),
);
