import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';

import React from 'react';

import Link from 'next/link';

import BaseButton from '@material-ui/core/Button';
import BaseIconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import SvgIcon from '@material-ui/core/SvgIcon';
import Typography from '@material-ui/core/Typography';

import { Avatar, AvatarSize } from '../atoms/Avatar';
import { Empty } from '../atoms/Empty';
import { useStyles } from './friendRequest.style';
import { useFriendRequestList } from './hooks/use-friend-request.hook';

import { WithAuthorizeAction } from 'components/common/Authorization/WithAuthorizeAction';
import ShowIf from 'src/components/common/show-if.component';
import { Friend } from 'src/interfaces/friend';
import { User } from 'src/interfaces/user';
import i18n from 'src/locale';

type FriendRequestProps = {
  user?: User;
  requests: Friend[];
  onAcceptRequest: (request: Friend) => void;
  onDeclineRequest: (request: Friend) => void;
};

const IconButton = WithAuthorizeAction(BaseIconButton);
const Button = WithAuthorizeAction(BaseButton);

export const FriendRequestComponent: React.FC<FriendRequestProps> = props => {
  const { user, requests, onAcceptRequest, onDeclineRequest } = props;
  const style = useStyles({});

  const list = useFriendRequestList(requests, user);

  if (requests.length === 0) {
    if (user.fullAccess)
      return (
        <Empty
          title={i18n.t('Friends.Empty.Friend_Request.Title')}
          subtitle={i18n.t('Friends.Empty.Friend_Request.Subtitle')}
        />
      );

    return (
      <Empty
        image={'/images/illustration/EmptyStateFriendReq.svg'}
        title={'Nothing to see here!'}
        subtitle="Connect your Web 3.0 wallet to unlock this feature"
        // eslint-disable-next-line react/no-children-prop
        children={
          <div style={{ width: '100%', marginTop: 24 }}>
            <Link
              href={{ pathname: '/wallet', query: { type: 'manage' } }}
              shallow
              passHref>
              <Button
                onClick={() => undefined}
                color="primary"
                variant="contained"
                size="small">
                {i18n.t('LiteVersion.ConnectWallet')}
              </Button>
            </Link>
          </div>
        }
        withImage
      />
    );
  }

  return (
    <div>
      <List>
        {list.map(request => (
          <ListItem className={style.item} alignItems="center" key={request.id}>
            <ListItemAvatar>
              <Avatar
                name={request.name}
                src={request.avatar}
                size={AvatarSize.MEDIUM}
              />
            </ListItemAvatar>
            <ListItemText>
              <Link
                href={'/profile/[id]'}
                as={`/profile/${request.id}`}
                shallow
                passHref>
                <Typography
                  className={style.name}
                  component="a"
                  color="textPrimary">
                  {request.name}
                </Typography>
              </Link>
              <ShowIf condition={!!request.totalMutual}>
                <Typography
                  className={style.friend}
                  component="p"
                  color="textSecondary">
                  {i18n.t('Friends.List.Mutual', {
                    total: request.totalMutual,
                  })}
                </Typography>
              </ShowIf>
            </ListItemText>
            <ListItemSecondaryAction>
              <Button
                onClick={() => onAcceptRequest(request.friend)}
                className={style.button}
                color="primary"
                variant="text"
                startIcon={
                  <SvgIcon
                    classes={{ root: style.fill }}
                    component={CheckCircleIcon}
                    viewBox="0 0 24 24"
                  />
                }>
                <Typography className={style.buttonText}>
                  {i18n.t('Friends.Button.Accept')}
                </Typography>
              </Button>
              <Button
                onClick={() => onDeclineRequest(request.friend)}
                className={style.button}
                color="secondary"
                variant="text"
                startIcon={
                  <SvgIcon
                    classes={{ root: style.fill }}
                    component={XCircleIcon}
                    viewBox="0 0 24 24"
                  />
                }>
                <Typography className={style.buttonText}>
                  {i18n.t('Friends.Button.Decline')}
                </Typography>
              </Button>
              <div className={style.iconButton}>
                <IconButton
                  aria-label="accept-friend"
                  onClick={() => onAcceptRequest(request.friend)}
                  disableRipple={true}
                  disableFocusRipple={true}
                  disableTouchRipple>
                  <SvgIcon
                    classes={{ root: style.fill }}
                    component={CheckCircleIcon}
                    viewBox="0 0 24 24"
                    color="primary"
                  />
                </IconButton>
                <IconButton
                  aria-label="decline-friend"
                  onClick={() => onDeclineRequest(request.friend)}
                  disableRipple={true}
                  disableFocusRipple={true}
                  disableTouchRipple>
                  <SvgIcon
                    classes={{ root: style.fill }}
                    component={XCircleIcon}
                    viewBox="0 0 24 24"
                    color="secondary"
                  />
                </IconButton>
              </div>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
};
