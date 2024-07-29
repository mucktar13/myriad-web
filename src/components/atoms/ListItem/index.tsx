import React from 'react';

import Image from 'next/image';

import { Typography } from '@material-ui/core';
import { AvatarProps } from '@material-ui/core/Avatar';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import SvgIcon from '@material-ui/core/SvgIcon';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Avatar, AvatarSize } from '../Avatar';

import ShowIf from 'components/common/show-if.component';

type ListItemComponentProps = ListItemProps & {
  icon?: any;
  avatar?: string;
  variant?: AvatarProps['variant'];
  size?: AvatarSize;
  title: string;
  subtitle?: string | React.ReactNode;
  action?: string | React.ReactNode;
  active?: boolean;
  url?: string;
  id?: string;
  isBanned?: boolean;
  isAnimated?: boolean;
};

const useStyles = makeStyles<Theme, ListItemComponentProps>((theme: Theme) =>
  createStyles({
    root: {
      paddingLeft: 0,
      [theme.breakpoints.up('sm')]: {
        display: props =>
          ['experience', 'wallet', 'topic', 'socials'].includes(
            props.id as string,
          ) && 'none',
      },
    },
    avatar: {
      minWidth: theme.spacing(3.75),
      marginRight: 20,
    },
    icon: {
      minWidth: 24,
      marginRight: 20,
      padding: 6,
    },
    active: {
      background: theme.palette.secondary.main,
      borderRadius: 6,
    },
    tiny: {
      width: 12,
      height: 12,
    },
    small: {
      width: theme.spacing(3.75),
      height: theme.spacing(3.75),
      fontSize: theme.typography.h5.fontSize,
    },
    medium: {
      width: theme.spacing(6),
      height: theme.spacing(6),
    },
    large: {
      width: theme.spacing(9),
      height: theme.spacing(9),
    },
    action: {
      right: theme.spacing(1),
    },
  }),
);

export const ListItemComponent: React.FC<ListItemComponentProps> = props => {
  const {
    icon,
    avatar,
    variant = 'circular',
    size = AvatarSize.SMALL,
    url,
    title,
    subtitle,
    action,
    active,
    onClick,
    isBanned = false,
    isAnimated = false,
  } = props;
  const styles = useStyles({ ...props });

  const iconSyles = [styles.icon];
  const listProps: any = {};

  if (url) {
    listProps.button = true;
  }

  if (active) {
    iconSyles.push(styles.active);
  }

  return (
    <ListItem
      data-testid={`list-item-${title}`}
      component="div"
      className={styles.root}
      ContainerComponent="div"
      onClick={onClick}
      {...listProps}>
      {icon ? (
        <ListItemIcon
          data-testid={`list-item-icon-${title}`}
          classes={{ root: iconSyles.join(' ') }}>
          <SvgIcon component={icon} />
        </ListItemIcon>
      ) : (
        <ListItemAvatar className={styles.avatar}>
          <Avatar
            title={isBanned ? undefined : title}
            alt={title}
            src={avatar}
            size={size}
            variant={variant}
            banned={isBanned}
          />
        </ListItemAvatar>
      )}

      <ListItemText
        primary={
          <Typography
            component="div"
            variant="h5"
            color={isBanned ? 'textSecondary' : 'textPrimary'}>
            &#8288;{title}
          </Typography>
        }
        secondary={
          subtitle ? (
            <Typography
              component="span"
              variant="subtitle1"
              color="textPrimary">
              {subtitle}
            </Typography>
          ) : undefined
        }
      />

      <ShowIf condition={isAnimated}>
        <Image
          src="/images/animated_new.gif"
          alt={'new'}
          width={40}
          height={20}
          quality={100}
        />
      </ShowIf>

      {action && (
        <ListItemSecondaryAction className={styles.action}>
          {action}
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};
