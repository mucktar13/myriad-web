import { PropTypes } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

type SendTipButtonProps = {
  mobile: boolean;
  color?: PropTypes.Color;
};

export const useStyles = makeStyles<Theme, SendTipButtonProps>(theme =>
  createStyles({
    root: {},
    button: {
      '&.MuiButton-sizeSmall': {
        width: props => (props.mobile ? 92 : 180),
        maxWidth: 'fit-content',
      },
      '& .MuiButton-label': {
        color: props =>
          props.mobile && props.color === 'secondary' ? '#404040' : 'inherit',
      },
      '& .MuiButton-startIcon': {
        color: props => (props.mobile ? '#FFD24D' : '#404040'),
      },
    },
    loading: {
      position: 'absolute',
      top: 'calc(50% - 7px)',
      right: 30,
    },
    wrapperButton: {
      marginTop: 32,
    },
    wrapperButtonFlex: {
      marginTop: 32,
      display: 'flex',
      justifyContent: 'space-between',
      gap: '8px',
    },
  }),
);
