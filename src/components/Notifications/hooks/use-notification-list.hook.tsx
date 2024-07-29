import {
  CheckIcon,
  ChatAlt2Icon,
  PlusIcon,
  ExclamationCircleIcon,
  AtSymbolIcon,
  ArrowCircleLeftIcon,
} from '@heroicons/react/solid';

import React from 'react';

import getConfig from 'next/config';

import { SvgIcon } from '@material-ui/core';

import { useStyles } from '../Notifications.styles';

import { parseScientificNotatedNumber } from 'src/helpers/number';
import {
  Notification,
  NotificationType,
  UnlockableContentReference,
} from 'src/interfaces/notification';
import { PostOrigin } from 'src/interfaces/timeline';
import { PAGINATION_LIMIT } from 'src/lib/api/constants/pagination';
import i18n from 'src/locale';

const { publicRuntimeConfig } = getConfig();

export type NotificationList = {
  id: string;
  type?: NotificationType;
  user: string;
  userId?: string;
  avatar?: string;
  description: React.ReactNode;
  badge: React.ReactNode;
  createdAt: Date;
  read: boolean;
  href: string;
  platform?: PostOrigin;
};

const getPlatform = (message: string) => {
  const result = message.split(' ');

  return result[3];
};

const parseTipAmountContainingENumber = (message: string) => {
  const result = message.split(' ');

  let resultInString = '';

  let amount = '';

  if (result.length === 2 && result[0] === '1e-8') {
    amount = parseScientificNotatedNumber(Number(result[0])) ?? '';

    result[0] = amount;

    resultInString = result.join(' ');
  } else {
    resultInString = message;
  }

  return resultInString;
};

const parseText = (message: string) => {
  try {
    const newMessage = JSON.parse(message);
    const text = newMessage[0].children[0].text;
    return text ? text : '';
  } catch {
    return '';
  }
};

export const useNotificationList = (
  notifications: Notification[],
  infinite = true,
  exclude: NotificationType[] = [],
): NotificationList[] => {
  const style = useStyles({});

  const excludes = [
    NotificationType.POST_VOTE,
    NotificationType.COMMENT_VOTE,
  ].concat(exclude);

  const getLockableContentLink = (
    reference?: UnlockableContentReference,
  ): string => {
    if (!reference) return `/404`;

    if ('post' in reference && reference.post?.id) {
      return `/post/${reference.post.id}`;
    }

    if ('comment' in reference && reference.comment?.id) {
      return `/post/${reference.comment?.postId}?comment=${reference?.comment?.id}&section=${reference.comment?.section}`;
    }

    return `/404`;
  };

  return notifications
    .filter(notification => !excludes.includes(notification.type))
    .filter(
      notification =>
        Boolean(notification.fromUserId) && Boolean(notification.toUserId),
    )
    .slice(0, infinite ? notifications.length : PAGINATION_LIMIT)
    .map(notification => {
      switch (notification.type) {
        case NotificationType.FRIEND_ACCEPT:
          return {
            id: notification.id,
            type: NotificationType.FRIEND_ACCEPT,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Friend_Accept'),
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={CheckIcon}
                  style={{ color: '#FFF', fill: 'currentColor' }}
                  viewBox="-4 -4 34 34"
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/profile/${notification.fromUserId.id}`,
          };

        case NotificationType.FRIEND_REQUEST:
          return {
            id: notification.id,
            type: NotificationType.FRIEND_REQUEST,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Friend_Request'),
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={PlusIcon}
                  viewBox="-4 -4 34 34"
                  style={{ color: '#FFF', fill: 'currentColor' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/friends?type=request`,
          };

        case NotificationType.POST_COMMENT:
          return {
            id: notification.id,
            type: NotificationType.POST_COMMENT,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description:
              i18n.t('Notification.Description.Post_Comment') +
              ' :\n"' +
              parseText(notification.message) +
              '"',
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={ChatAlt2Icon}
                  viewBox="-4 -4 34 34"
                  style={{ fill: 'currentColor', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.additionalReferenceId
              ? `/post/${notification.additionalReferenceId?.comment?.postId}?comment=${notification.additionalReferenceId?.comment?.id}&section=${notification.additionalReferenceId?.comment?.section}`
              : `/404`,
          };

        case NotificationType.COMMENT_COMMENT:
          return {
            id: notification.id,
            type: NotificationType.COMMENT_COMMENT,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Comment_Comment'),
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={ChatAlt2Icon}
                  viewBox="-4 -4 34 34"
                  style={{ fill: 'currentColor', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.additionalReferenceId
              ? `/post/${notification.additionalReferenceId?.comment?.postId}?comment=${notification.additionalReferenceId?.comment?.id}&section=${notification.additionalReferenceId?.comment?.section}`
              : `/404`,
          };

        case NotificationType.POST_MENTION:
          return {
            id: notification.id,
            type: NotificationType.POST_MENTION,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Post_Mention'),
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={AtSymbolIcon}
                  viewBox="-4 -4 34 34"
                  style={{ fill: 'currentColor', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.referenceId
              ? `/post/${notification.referenceId}`
              : `/404`,
          };

        case NotificationType.COMMENT_MENTION:
          return {
            id: notification.id,
            type: NotificationType.COMMENT_MENTION,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Comment_Mention'),
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={AtSymbolIcon}
                  viewBox="-4 -4 34 34"
                  style={{ fill: 'currentColor', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.referenceId
              ? `/post/${notification.additionalReferenceId?.comment?.postId}?comment=${notification.additionalReferenceId?.comment?.id}&section=${notification.additionalReferenceId?.comment?.section}`
              : `/404`,
          };

        case NotificationType.POST_VOTE:
          return {
            id: notification.id,
            type: NotificationType.POST_VOTE,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: notification.message,
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/`,
          };

        case NotificationType.COMMENT_VOTE:
          return {
            id: notification.id,
            type: NotificationType.COMMENT_VOTE,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: notification.message,
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/`,
          };

        case NotificationType.USER_TIPS:
        case NotificationType.USER_TIPS_UNCLAIMED:
          return {
            id: notification.id,
            type: NotificationType.USER_TIPS,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Tips_received'),
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.User_Tip', {
              name: notification.fromUserId.name,
              amount: parseTipAmountContainingENumber(notification.message),
            }),
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href:
              notification.type === NotificationType.USER_TIPS
                ? `/wallet?type=history`
                : `/wallet?type=tip`,
          };

        case NotificationType.POST_TIPS:
        case NotificationType.POST_TIPS_UNCLAIMED:
          return {
            id: notification.id,
            type: NotificationType.POST_TIPS,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Tips_received'),
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Post_Tip', {
              name: notification.fromUserId.name,
              amount: parseTipAmountContainingENumber(notification.message),
            }),
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `${
              notification.type === NotificationType.POST_TIPS_UNCLAIMED
                ? '/wallet?type=tip'
                : notification.additionalReferenceId
                ? '/post/' + notification?.additionalReferenceId?.post?.id
                : '/wallet?type=history'
            }`,
          };

        case NotificationType.COMMENT_TIPS:
        case NotificationType.COMMENT_TIPS_UNCLAIMED:
          return {
            id: notification.id,
            type: NotificationType.COMMENT_TIPS,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Tips_received'),
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.Comment_Tip', {
              name: notification.fromUserId.name,
              amount: parseTipAmountContainingENumber(notification.message),
            }),
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href:
              notification.type === NotificationType.COMMENT_TIPS_UNCLAIMED
                ? '/wallet?type=tip'
                : notification.additionalReferenceId
                ? '/post/' +
                  notification?.additionalReferenceId?.comment?.postId
                : '/wallet?type=history',
          };

        case NotificationType.USER_CLAIM_TIPS:
          return {
            id: notification.id,
            type: NotificationType.USER_CLAIM_TIPS,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Claimed'),
            avatar: notification.fromUserId.profilePictureURL,
            description: `${notification.message}`,
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/wallet?type=history`,
          };

        case NotificationType.USER_INITIAL_TIPS:
          return {
            id: notification.id,
            type: NotificationType.USER_INITIAL_TIPS,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Claimed'),
            avatar: notification.fromUserId.profilePictureURL,
            description: `${notification.message}`,
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/wallet?type=history`,
          };

        case NotificationType.USER_REWARD:
          return {
            id: notification.id,
            type: NotificationType.USER_REWARD,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Reward'),
            avatar: notification.fromUserId.profilePictureURL,
            description: `${notification.message}`,
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: `/wallet?type=history`,
          };

        case NotificationType.POST_REMOVED:
          return {
            id: notification.id,
            type: NotificationType.POST_REMOVED,
            read: notification.read,
            user: i18n.t('Notification.Header.Post_Removed'),
            avatar: notification.fromUserId.profilePictureURL,
            description: notification.message.includes('approved')
              ? i18n.t('Notification.Description.Report.Approved')
              : i18n.t('Notification.Description.Report.Removed'),
            badge: (
              <div className={style.circleError}>
                <SvgIcon
                  component={ExclamationCircleIcon}
                  style={{ color: '#FFF', fill: 'currentColor' }}
                  viewBox="-4 -4 34 34"
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.message.includes('approved')
              ? ''
              : `${publicRuntimeConfig.myriadSupportMail}?subject=Complain post take down!`,
          };

        case NotificationType.COMMENT_REMOVED:
          return {
            id: notification.id,
            type: NotificationType.COMMENT_REMOVED,
            read: notification.read,
            user: i18n.t('Notification.Header.Comment_Removed'),
            avatar: notification.fromUserId.profilePictureURL,
            description: notification.message.includes('approved')
              ? notification.additionalReferenceId &&
                i18n.t('Notification.Description.Comment_Removed.Other', {
                  name: notification.additionalReferenceId?.comment?.user?.name,
                })
              : i18n.t('Notification.Description.Comment_Removed.User'),
            badge: (
              <div className={style.circleError}>
                <SvgIcon
                  component={ExclamationCircleIcon}
                  style={{ color: '#FFF', fill: 'currentColor' }}
                  viewBox="-4 -4 34 34"
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.additionalReferenceId
              ? `/post/${notification.additionalReferenceId?.comment?.postId}`
              : '/404',
          };

        case NotificationType.USER_BANNED:
          return {
            id: notification.id,
            type: NotificationType.USER_BANNED,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.User_Reported'),
            avatar: notification.fromUserId.profilePictureURL,
            description: notification.message.includes('approved')
              ? notification.additionalReferenceId &&
                i18n.t('Notification.Description.User_Banned.Other', {
                  name: notification.additionalReferenceId?.user?.name,
                })
              : i18n.t('Notification.Description.User_Banned.User'),
            badge: (
              <div className={style.circleError}>
                <SvgIcon
                  component={ExclamationCircleIcon}
                  style={{ color: '#FFF', fill: 'currentColor' }}
                  viewBox="-4 -4 34 34"
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: '',
          };

        case NotificationType.CONNECTED_SOCIAL_MEDIA:
          return {
            id: notification.id,
            type: NotificationType.CONNECTED_SOCIAL_MEDIA,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Account_Linked'),
            avatar:
              notification.toUserId.profilePictureURL ??
              notification.toUserId.name,
            description: i18n.t('Notification.Description.Connect_Socmed', {
              platform: getPlatform(notification.message),
              username:
                notification.additionalReferenceId &&
                notification.additionalReferenceId?.people?.username,
            }),
            badge: (
              <div className={style.circleError}>
                <SvgIcon
                  component={ExclamationCircleIcon}
                  style={{ color: '#FFF', fill: 'currentColor' }}
                  viewBox="-4 -4 34 34"
                />
              </div>
            ),
            createdAt: notification.createdAt,
            platform: getPlatform(notification.message) as PostOrigin,
            href: `/socials`,
          };

        case NotificationType.DISCONNECTED_SOCIAL_MEDIA:
          return {
            id: notification.id,
            type: NotificationType.DISCONNECTED_SOCIAL_MEDIA,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: i18n.t('Notification.Header.Account_Unlinked'),
            avatar:
              notification.toUserId.profilePictureURL ??
              notification.toUserId.name,
            description: i18n.t('Notification.Description.Disconnect_Socmed', {
              platform: getPlatform(notification.message),
              username:
                notification.additionalReferenceId &&
                notification.additionalReferenceId?.people?.username,
              user: notification.fromUserId.username,
            }),
            badge: (
              <div className={style.circleError}>
                <SvgIcon
                  component={ExclamationCircleIcon}
                  style={{ color: '#FFF', fill: 'currentColor' }}
                  viewBox="-4 -4 34 34"
                />
              </div>
            ),
            createdAt: notification.createdAt,
            platform: getPlatform(notification.message) as PostOrigin,
            href: `/socials`,
          };

        case NotificationType.PAID_CONTENT:
          return {
            id: notification.id,
            type: NotificationType.PAID_CONTENT,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description: i18n.t('Notification.Description.UnlockedContent'),
            badge: (
              <div className={style.circleSuccess}>
                <SvgIcon
                  component={ArrowCircleLeftIcon}
                  viewBox="2 2 20 20"
                  style={{ fill: '#47B881', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.additionalReferenceId
              ? getLockableContentLink(
                  notification.additionalReferenceId?.unlockableContent,
                )
              : `/404`,
          };

        case NotificationType.VOTE_COUNT:
          return {
            id: notification.id,
            type: NotificationType.VOTE_COUNT,
            read: notification.read,
            user: i18n.t('Notification.Header.Upvote'),
            avatar: 'default',
            description: i18n.t('Notification.Description.Upvote', {
              amount: notification.message ?? 0,
            }),
            badge: null,
            createdAt: notification.createdAt,
            href: notification.referenceId
              ? `/post/${notification.referenceId}`
              : `/404`,
          };

        case NotificationType.FOLLOWER_COUNT:
          return {
            id: notification.id,
            type: NotificationType.FOLLOWER_COUNT,
            read: notification.read,
            user: i18n.t('Notification.Header.Follower'),
            avatar: 'default',
            description: i18n.t('Notification.Description.Follower', {
              amount: notification.message ?? 0,
            }),
            badge: null,
            createdAt: notification.createdAt,
            href: notification.referenceId
              ? `/experience/${notification.referenceId}`
              : `/404`,
          };

        default:
          return {
            id: notification.id,
            read: notification.read,
            userId: notification.fromUserId.id,
            user: notification.fromUserId.name,
            avatar: notification.fromUserId.profilePictureURL,
            description:
              notification.message === 'mentioned you'
                ? 'mentioned you in a comment'
                : notification.message,
            badge: (
              <div className={style.circle}>
                <SvgIcon
                  component={AtSymbolIcon}
                  viewBox="-4 -4 34 34"
                  style={{ fill: 'currentColor', color: '#FFF' }}
                />
              </div>
            ),
            createdAt: notification.createdAt,
            href: notification.additionalReferenceId
              ? `/post/${notification.additionalReferenceId?.comment?.postId}?comment=${notification.additionalReferenceId?.comment?.id}`
              : `/404`,
          };
      }
    });
};
