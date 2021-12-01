import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 840,
    },
    input: {
      marginBottom: 30,
    },
    title: {
      marginBottom: 20,
    },
    preview: {
      border: '1px solid',
      borderColor: '#E5E5E5',
      borderRadius: 5,
      background: '#FFF',
      padding: 30,
    },
  }),
);
