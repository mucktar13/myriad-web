import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ProfileHeaderComponent } from '.';

import { useTimelineFilter } from 'components/PostList/hooks/use-timeline-filter.hook';
import useTipHistoryHook from 'components/TipHistory/use-tip-history.hook';
import { useEnqueueSnackbar } from 'components/common/Snackbar/useEnqueueSnackbar.hook';
import debounce from 'lodash/debounce';
import { useFriendRequest } from 'src/hooks/use-friend-request.hook';
import { useQueryParams } from 'src/hooks/use-query-params.hooks';
import { useReport } from 'src/hooks/use-report.hook';
import { FriendStatus } from 'src/interfaces/friend';
import { ReportProps } from 'src/interfaces/report';
import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import { blockFromFriend } from 'src/reducers/friend/actions';
import {
  fetchProfileDetail,
  fetchProfileExperience,
  fetchProfileFriend,
} from 'src/reducers/profile/actions';
import { ProfileState } from 'src/reducers/profile/reducer';
import { UserState } from 'src/reducers/user/reducer';

type Props = {
  edit?: () => void;
};

export const ProfileHeaderContainer: React.FC<Props> = ({ edit }) => {
  const dispatch = useDispatch();
  const enqueueSnackbar = useEnqueueSnackbar();

  const { user } = useSelector<RootState, UserState>(state => state.userState);
  const { detail: profile, friendStatus } = useSelector<
    RootState,
    ProfileState
  >(state => state.profileState);

  const { requestFriend, removeFriendRequest, toggleRequest } =
    useFriendRequest();
  const { sendReportWithAttributes } = useReport();
  const { open: openTipHistory } = useTipHistoryHook();
  const { query } = useQueryParams();
  const { filterTimeline } = useTimelineFilter({ owner: profile?.id });

  const urlLink = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  useEffect(() => {
    if (profile) {
      dispatch(fetchProfileExperience());
      filterTimeline(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const sendFriendReqest = debounce(() => {
    if (!profile) return;

    requestFriend(profile);
  }, 300);

  const declineFriendRequest = debounce(() => {
    if (!profile?.friendInfo?.status) return;

    removeFriendRequest(profile);
  }, 300);

  const handleSubmitReport = (payload: ReportProps) => {
    sendReportWithAttributes(payload);
  };

  const handleBlockUser = async () => {
    if (!profile) return;

    await dispatch(blockFromFriend(profile.id));
    await dispatch(fetchProfileDetail(profile.id));
    await dispatch(fetchProfileFriend());

    enqueueSnackbar({
      message: i18n.t('Profile.Header.Alert.Success_Block'),
      variant: 'success',
    });
  };

  const handleUnblockUser = (friendId: string) => {
    toggleRequest(friendId, FriendStatus.PENDING);
  };

  const handleAcceptFriend = debounce(() => {
    if (profile?.friendInfo?.status) {
      toggleRequest(profile?.friendInfo?.id ?? '', FriendStatus.APPROVED);

      enqueueSnackbar({
        message: i18n.t('Profile.Header.Alert.Success_Req'),
        variant: 'success',
      });
    }
  }, 300);

  const handleRemoveFriend = () => {
    const status = profile?.friendInfo?.status;

    if (status) {
      removeFriendRequest(profile, () => {
        if (status === 'approved') {
          enqueueSnackbar({
            message: i18n.t('Profile.Header.Alert.Unfriend', {
              name: profile?.name,
            }),
            variant: 'success',
          });
        }
      });
    }
  };

  if (!profile) return null;

  return (
    <>
      <ProfileHeaderComponent
        person={profile}
        user={user}
        status={friendStatus}
        onSendRequest={sendFriendReqest}
        onDeclineRequest={declineFriendRequest}
        onBlock={handleBlockUser}
        onUnblockFriend={handleUnblockUser}
        onEdit={edit}
        linkUrl={`${urlLink()}/profile/${profile.id}`}
        onSubmitReport={handleSubmitReport}
        onRemoveFriend={handleRemoveFriend}
        onAcceptFriend={handleAcceptFriend}
        onOpenTipHistory={openTipHistory}
      />
    </>
  );
};
