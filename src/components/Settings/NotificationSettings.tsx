import React from 'react';

import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
  Typography,
} from '@material-ui/core';
import BaseButton from '@material-ui/core/Button';

import { useStyles } from './Settings.styles';
import {
  useNotificationSetting,
  NotificationSettingsOption,
} from './hooks/use-notification-setting.hook';

import { WithAuthorizeAction } from 'components/common/Authorization/WithAuthorizeAction';
import { NotificationSettingItems } from 'src/interfaces/setting';
import i18n from 'src/locale';

type NotificationSettingsProps = {
  value: NotificationSettingItems;
  onSaveSetting: (props: NotificationSettingItems) => void;
};

const Button = WithAuthorizeAction(BaseButton);

export const NotificationSettings: React.FC<NotificationSettingsProps> =
  props => {
    const { value, onSaveSetting } = props;
    const styles = useStyles();
    const { settings, settingsProp, changeSetting, setNotificationSetting } =
      useNotificationSetting(value);

    React.useEffect(() => {
      setNotificationSetting(value);
    }, [value]);

    const handleChangeSetting =
      (item: NotificationSettingsOption) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        changeSetting(item.id, event.target.checked);
      };

    const saveSetting = () => {
      onSaveSetting(settingsProp);
    };

    return (
      <Paper elevation={0} className={styles.root}>
        <List>
          {settings.map(item => {
            return (
              <ListItem
                key={item.id}
                button
                className={styles.option}
                alignItems="center">
                <ListItemText>
                  <Typography variant="h5" color="textPrimary">
                    {item.title}
                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                  <Switch
                    checked={item.enabled}
                    color="primary"
                    onChange={handleChangeSetting(item)}
                    name={item.id}
                    inputProps={{ 'aria-label': `${item.title} checkbox` }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <div className={styles.action}>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            fullWidth
            onClick={saveSetting}>
            {i18n.t('Setting.List_Menu.Notification_Setting.Confirm')}
          </Button>
        </div>
      </Paper>
    );
  };
