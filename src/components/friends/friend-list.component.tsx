import React from 'react';
import {useSelector} from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import {createStyles, Theme, makeStyles} from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import {ListHeaderComponent} from './list-header.component';
import {useFriendList} from './use-friend-list.hook';

import ShowIf from 'src/components/common/show-if.component';
import {RootState} from 'src/reducers';
import {FriendState} from 'src/reducers/friend/reducer';

type FriendsListProps = {
  showOnlineStatus?: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      margin: '8px 0',
    },
    header: {
      marginBottom: theme.spacing(2),
      display: 'flex',
    },
    content: {
      '&:last-child': {
        paddingBottom: 0,
      },
    },
    empty: {
      fontWeight: 500,
      fontSize: 14,
      textAlign: 'center',
      padding: '16px 0',
      color: '#B1AEB7',
    },
    list: {
      marginLeft: theme.spacing(-2),
      marginRight: theme.spacing(-2),
    },
    item: {
      marginBottom: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
      '& .MuiListItemText-root': {
        alignSelf: 'center',
      },
      '& .MuiTypography-root': {
        fontSize: 16,
        fontWeight: 400,
      },
    },
    online: {
      color: '#06960C',
    },
  }),
);

const FriendsListComponent: React.FC<FriendsListProps> = ({showOnlineStatus = false}) => {
  const style = useStyles();

  const {totalFriend} = useSelector<RootState, FriendState>(state => state.friendState);
  const friends = useFriendList();

  return (
    <Box className={style.root}>
      <ListHeaderComponent title={`Friends (${totalFriend})`} />

      <div className={style.content}>
        <ShowIf condition={friends.length === 0}>
          <Typography variant="h4" color="textPrimary" className={style.empty}>
            You don&apos;t have any Myriad friends yet. Search for people or tell your friends about
            Myriad!
          </Typography>
        </ShowIf>

        <List className={style.list}>
          {friends.map(people => (
            <ListItem key={people.id} className={style.item} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar alt={people.name} src={people.avatar} />
              </ListItemAvatar>
              <ListItemText>
                <Typography component="span" variant="h4" color="textPrimary">
                  {people.name}
                </Typography>
              </ListItemText>
              {showOnlineStatus && (
                <ListItemSecondaryAction>
                  <FiberManualRecordIcon className={style.online} />
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      </div>
    </Box>
  );
};

export default FriendsListComponent;
