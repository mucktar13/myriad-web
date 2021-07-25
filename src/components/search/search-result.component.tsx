import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import Link from 'next/link';

import {IconButton} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import {PeopleCardComponent} from 'src/components/common/people-card.component';
import {useFriendsHook} from 'src/hooks/use-friends-hook';
import {FriendStatus} from 'src/interfaces/friend';
import {User} from 'src/interfaces/user';
import {RootState} from 'src/reducers';
import {UserState} from 'src/reducers/user/reducer';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '0 24px 0 24px',
      height: '100vh',
      [theme.breakpoints.up('xl')]: {
        maxWidth: 926,
      },
    },
    header: {
      padding: 8,
    },
    back: {
      background: theme.palette.secondary.light,
      color: theme.palette.background.paper,
      width: 40,
      height: 40,
    },
    searchContent: {
      marginTop: theme.spacing(1),
      maxHeight: 1200,
      overflow: 'auto',
    },
  }),
);

type SearchResultProps = {
  query: string;
  options: User[];
};

const SearchResultComponent: React.FC<SearchResultProps> = ({query, options}) => {
  const styles = useStyles();

  const {anonymous, user} = useSelector<RootState, UserState>(state => state.userState);
  const {loading, friended: friendsList, checkFriendStatus, sendRequest} = useFriendsHook();

  useEffect(() => {
    // list all transaction user id as param
    if (!anonymous && user) checkFriendStatus([user]);
  }, []);

  const getFriendRequestStatus = (prople: User) => {
    const request = friendsList.find(friend => {
      return friend.requestorId === prople.id || friend.friendId === prople.id;
    });

    return request?.status;
  };

  const isFriendRequestSent = (prople: User): boolean => {
    const friendRequestStatus = getFriendRequestStatus(prople);

    if (!friendRequestStatus) return false;

    return [FriendStatus.PENDING, FriendStatus.APPROVED, FriendStatus.REJECTED].includes(
      friendRequestStatus,
    );
  };

  const sendFriendRequest = async (destination: User) => {
    await sendRequest(destination);

    if (user) checkFriendStatus([user]);
  };

  if (loading) return null;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Typography variant="h4" style={{marginBottom: 8}}>
          Search results for {query}:
        </Typography>
      </div>

      <div>
        <Link href="/home" passHref>
          <IconButton className={styles.back} aria-label="back" size="medium">
            <ArrowBackIcon />
          </IconButton>
        </Link>
      </div>

      <div>
        <Grid container spacing={3} className={styles.searchContent}>
          {options.length === 0 ? (
            <Grid container justify="center">
              <Typography>No results found!</Typography>
            </Grid>
          ) : (
            options.map(people => (
              <Grid item xs={12} sm={6} key={people.id}>
                <PeopleCardComponent
                  people={people}
                  disableAction={anonymous || isFriendRequestSent(people)}
                  showAction={user?.id !== people.id}
                  friendStatus={getFriendRequestStatus(people)}
                  sendFriendRequest={sendFriendRequest}
                />
              </Grid>
            ))
          )}
        </Grid>
      </div>
    </div>
  );
};

export default SearchResultComponent;
