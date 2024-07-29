import React from 'react';

import { IconButton, Typography } from '@material-ui/core';
import Link from '@material-ui/core/Link';
import BaseTooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

import { InfoIcon } from 'src/components/atoms/Icons';
import i18n from 'src/locale';

const Tooltip = withStyles({
  tooltipPlacementRight: {
    margin: '50px 0px 0px -1.5px',
  },
})(BaseTooltip);

export const TippingInfo: React.FC = () => (
  <Tooltip
    PopperProps={{ keepMounted: true }}
    interactive
    placement="right"
    disableFocusListener
    disableTouchListener
    enterDelay={500}
    leaveDelay={1500}
    title={
      <Typography>
        {i18n.t('Tipping.Modal_Main.Tooltip')}
        <Link
          color="secondary"
          variant="inherit"
          target="_blank"
          href="https://support.polkadot.network/support/solutions/articles/65000168651-what-is-the-existential-deposit-"
          rel="noopener noreferrer">
          {i18n.t('Tipping.Modal_Main.Tooltip_Read_More')}
        </Link>
      </Typography>
    }>
    <IconButton style={{ backgroundColor: 'transparent', padding: 1 }}>
      <InfoIcon />
    </IconButton>
  </Tooltip>
);
