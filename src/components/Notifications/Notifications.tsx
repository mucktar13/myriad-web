import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  Badge,
  Button,
  Grid,
  ListItemSecondaryAction,
} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Theme, withStyles, createStyles } from '@material-ui/core/styles';

import { Avatar, AvatarSize } from '../atoms/Avatar';
import { SocialAvatar } from '../atoms/SocialAvatar';
import ShowIf from '../common/show-if.component';
import { useStyles } from './Notifications.styles';
import {
  useNotificationList,
  NotificationList,
} from './hooks/use-notification-list.hook';

import clsx from 'clsx';
import { MyriadCircleIcon } from 'components/atoms/Icons';
import { Loading } from 'src/components/atoms/Loading';
import { timeAgo } from 'src/helpers/date';
import { acronym } from 'src/helpers/string';
import { Notification, NotificationType } from 'src/interfaces/notification';
import i18n from 'src/locale';

type NotificationsProps = {
  notifications: Notification[];
  unread: number;
  hasMore: boolean;
  gutter?: number;
  infinite?: boolean;
  size?: 'small' | 'medium';
  exclude?: NotificationType[];
  onLoadNextPage: () => void;
  onMarkAllAsRead: () => void;
  onMarkItemAsRead: (notificationId: string, callback: () => void) => void;
};

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      right: 14,
      top: 36,
      width: 20,
      height: 20,
      padding: 0,
      overflow: 'hidden',
    },
  }),
)(Badge);

export const Notifications: React.FC<NotificationsProps> = props => {
  const {
    notifications,
    hasMore,
    infinite = true,
    size = 'medium',
    gutter = 0,
    exclude = [],
    unread,
    onLoadNextPage,
    onMarkAllAsRead,
    onMarkItemAsRead,
  } = props;

  const style = useStyles({ gutter, size });
  const router = useRouter();

  const list = useNotificationList(notifications, infinite, exclude);

  const handleVisitProfile = (notification: NotificationList) => () => {
    if (notification.userId) {
      router.push(`/profile/${notification.userId}`);
    }
  };

  const handleReadNotification = (notification: NotificationList) => () => {
    onMarkItemAsRead(notification.id, () => {
      if (!notification.href && notification.href.trim().length === 0) return;
      if (notification.href.includes('@')) {
        window.open(`mailto:${notification.href}`, '_blank');
      } else {
        router.push(notification.href);
      }
    });
  };

  return (
    <Paper className={style.root}>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        className={style.header}>
        <Typography className={style.title} color="textPrimary">
          {i18n.t('Notification.Header.Title')}
        </Typography>
        <Button
          style={{ width: 'auto' }}
          color="primary"
          disabled={unread === 0}
          onClick={onMarkAllAsRead}>
          {i18n.t('Notification.Header.Read')}
        </Button>
      </Grid>
      <List className={style.list} component="div">
        <InfiniteScroll
          scrollableTarget="scrollable-timeline"
          dataLength={notifications.length}
          hasMore={hasMore && infinite}
          next={onLoadNextPage}
          loader={<Loading />}>
          {list.map(notification => {
            return (
              <ListItem
                key={notification.id}
                onClick={handleReadNotification(notification)}
                button
                component="a"
                ContainerComponent="div"
                disableGutters={gutter === 0}
                className={clsx({
                  [style.item]: true,
                  [style.unread]: !notification.read,
                })}
                alignItems="center">
                <ListItemAvatar className={style.avatarItem}>
                  {notification.user === 'Account unlinked' ||
                  notification.user === 'Account linked' ? (
                    <SocialAvatar
                      origin={notification.platform ?? 'myriad'}
                      name={notification.avatar ?? 'Myriad'}
                      onClick={handleVisitProfile(notification)}
                    />
                  ) : (
                    <StyledBadge badgeContent={notification.badge}>
                      {notification.avatar === 'default' ? (
                        <MyriadCircleIcon width={40} height={40} />
                      ) : (
                        <Avatar
                          name={
                            notification.avatar
                              ? acronym(notification.avatar)
                              : acronym(notification.user)
                          }
                          src={notification.avatar}
                          size={AvatarSize.MEDIUM}
                        />
                      )}
                    </StyledBadge>
                  )}
                </ListItemAvatar>
                <ListItemText className={style.textItem}>
                  <Typography variant="h5" color="textPrimary">
                    {notification.user}
                  </Typography>
                  <Typography
                    variant={size === 'medium' ? 'body1' : 'subtitle2'}
                    color="textSecondary"
                    className={style.description}>
                    {notification.description}
                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction className={style.time}>
                  <Typography
                    variant={size === 'medium' ? 'body1' : 'subtitle2'}
                    color="textSecondary">
                    {timeAgo(new Date(notification.createdAt))}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </InfiniteScroll>
      </List>

      <ShowIf condition={!infinite}>
        <div className={style.footer}>
          <Link href="/notification">
            <a className={style.link}>
              <Typography style={{ fontWeight: 'bold' }}>
                {i18n.t('Notification.Footer.View')}
              </Typography>
            </a>
          </Link>
        </div>
      </ShowIf>
    </Paper>
  );
};
