import React from 'react';

import Box from '@material-ui/core/Box';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

type TabPanelProps = {
  value: string | number;
  index: string | number;
  children: React.ReactNode;
  padding?: number;
  paddingLeft?: number;
  paddingRight?: number;
};

const useStyles = makeStyles<Theme, TabPanelProps>(theme =>
  createStyles({
    root: {
      paddingLeft: props => props.paddingLeft,
      paddingRight: props => props.paddingRight,
      [theme.breakpoints.down('xs')]: {
        background: () => 'none',
      },
    },
  }),
);

export const TabPanel: React.FC<TabPanelProps> = props => {
  const {children, value, index, padding = 3, paddingLeft = 0, paddingRight = 0} = props;
  const styles = useStyles({...props, paddingLeft, paddingRight});

  return (
    <div className={styles.root} hidden={value !== index} role="tabpanel">
      <Box p={padding} className={styles.root}>
        {children}
      </Box>
    </div>
  );
};
