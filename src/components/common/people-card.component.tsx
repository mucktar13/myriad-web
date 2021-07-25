import React from 'react';

import Link from 'next/link';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

import ShowIf from '../common/show-if.component';

import {FriendStatus} from 'src/interfaces/friend';
import {User} from 'src/interfaces/user';

interface PeopleCardProps {
  people: User;
  disableAction: boolean;
  showAction: boolean;
  friendStatus?: FriendStatus;
  sendFriendRequest: (user: User) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    listWrapper: {
      textAlign: 'center',
    },
    iconButton: {
      margin: theme.spacing(1),
    },
  }),
);

export const PeopleCardComponent: React.FC<PeopleCardProps> = ({
  people,
  disableAction,
  showAction,
  friendStatus,
  sendFriendRequest,
}) => {
  const style = useStyles();

  return (
    <Card>
      <CardHeader
        avatar={<Avatar aria-label="avatar" src={people.profilePictureURL} />}
        title={people.name}
      />
      <CardActions>
        <div className={style.listWrapper}>
          <Link href={`/${people.id}`} passHref>
            <Button size="medium" variant="contained" color="default" className={style.iconButton}>
              Visit Profile
            </Button>
          </Link>
          {showAction && (
            <Button
              size="medium"
              variant="contained"
              color="primary"
              onClick={() => sendFriendRequest(people)}
              disabled={disableAction}
              className={style.iconButton}
              startIcon={
                <>
                  <ShowIf condition={!friendStatus}>
                    <PersonAddIcon />
                  </ShowIf>
                  <ShowIf condition={friendStatus === FriendStatus.APPROVED}>
                    <PersonIcon />
                  </ShowIf>
                </>
              }>
              <ShowIf condition={!friendStatus}>Add Friend</ShowIf>
              <ShowIf condition={friendStatus === FriendStatus.PENDING}>Request Sent</ShowIf>
              <ShowIf condition={friendStatus === FriendStatus.APPROVED}>Friend</ShowIf>
              <ShowIf condition={friendStatus === FriendStatus.REJECTED}>Rejected</ShowIf>
            </Button>
          )}
        </div>
      </CardActions>
    </Card>
  );
};
