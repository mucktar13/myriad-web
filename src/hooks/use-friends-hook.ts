import { useSelector, useDispatch } from 'react-redux';

import { useBlockList } from './use-blocked-list.hook';

import { Friend, FriendStatus } from 'src/interfaces/friend';
import { User } from 'src/interfaces/user';
import { ListMeta } from 'src/lib/api/interfaces/base-list.interface';
import { SortType } from 'src/lib/api/interfaces/pagination-params.interface';
import { RootState } from 'src/reducers';
import {
  fetchFriendRequest,
  createFriendRequest,
  toggleFriendRequest,
  deleteFriendRequest,
} from 'src/reducers/friend-request/actions';
import {
  clearFriend,
  fetchFriend,
  searchFriend,
  updateFriendParams,
} from 'src/reducers/friend/actions';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useFriendsHook = (user?: User) => {
  const dispatch = useDispatch();
  const { load: loadBlockedUsers } = useBlockList(user);

  const filter = useSelector<RootState, string | undefined>(
    state => state.friendState.filter,
  );
  const { currentPage: currentFriendPage, totalPageCount } = useSelector<
    RootState,
    ListMeta
  >(state => state.friendState.meta);
  const { currentPage: currentFriendRequestPage } = useSelector<
    RootState,
    ListMeta
  >(state => state.friendRequestState.meta);

  const loadRequests = () => {
    if (!user) return;

    dispatch(fetchFriendRequest(user));
  };

  const loadMoreRequests = () => {
    dispatch(fetchFriendRequest(currentFriendRequestPage + 1));
  };

  const loadFriends = () => {
    if (!user) return;

    dispatch(fetchFriend(user));
  };

  const loadMoreFriends = () => {
    if (filter) {
      dispatch(searchFriend(filter, currentFriendPage + 1));
    } else {
      dispatch(fetchFriend(user, currentFriendPage + 1));
    }
  };

  const searchFriends = (query: string) => {
    if (!user) return;

    if (query.length === 0) {
      loadFriends();

      return;
    }

    dispatch(searchFriend(query));
  };

  const sort = (sort: SortType) => {
    dispatch(updateFriendParams({ sort }));

    if (filter) {
      searchFriends(filter);
    } else {
      loadFriends();
    }
  };

  const sendRequest = async (destination: User) => {
    await dispatch(createFriendRequest(destination));
  };

  const toggleRequest = async (request: Friend, status: FriendStatus) => {
    dispatch(
      toggleFriendRequest(request.id, status, () => {
        loadBlockedUsers();
      }),
    );
  };

  const removeFriendRequest = async (request: Friend) => {
    dispatch(deleteFriendRequest(request.id));
  };

  const clear = () => {
    dispatch(clearFriend());
  };

  return {
    hasMore: currentFriendPage < totalPageCount,
    loadFriends,
    loadMoreFriends,
    searchFriend: searchFriends,
    sort,
    loadRequests,
    loadMoreRequests,
    sendRequest,
    toggleRequest,
    removeFriendRequest,
    clear,
  };
};
