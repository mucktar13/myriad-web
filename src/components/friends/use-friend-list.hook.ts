import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {RootState} from '../../reducers';
import {FriendState} from '../../reducers/friend/reducer';
import {UserState} from '../../reducers/user/reducer';

type FriendListItem = {
  id: string;
  avatar: string;
  name: string;
  online: boolean;
};

export const useFriendList = (): FriendListItem[] => {
  const {user} = useSelector<RootState, UserState>(state => state.userState);
  const {friends} = useSelector<RootState, FriendState>(state => state.friendState);
  const [list, setList] = useState<FriendListItem[]>([]);

  useEffect(() => {
    if (user) {
      const requests: FriendListItem[] = friends.map(request => {
        const people = user?.id !== request.requestorId ? request.requestor : request.friend;

        return {
          id: request.id,
          avatar: people.profilePictureURL || '',
          name: people.name,
          online: true,
        };
      });

      setList(requests);
    }
  }, [user, friends]);

  return list;
};
