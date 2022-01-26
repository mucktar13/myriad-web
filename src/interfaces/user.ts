import {BaseModel} from './base.interface';
import {Currency, CurrencyId} from './currency';
import {FriendStatus} from './friend';
import {People} from './people';
import {TransactionDetail} from './transaction';

export interface UserSocialMedia {
  id: string;
  verified: boolean;
  platform: string;
  peopleId: string;
  userId: string;
  primary: boolean;
}

export type BaseUser = {
  name: string;
  profilePictureURL?: string;
  defaultCurrency: CurrencyId;
};

export type UserOnTransaction = BaseUser & {
  id: string;
};

export type UserProps = BaseUser & {
  bio?: string;
  bannerImageUrl?: string;
  fcmTokens?: string[];
  skipTour?: boolean;
  onTimeline?: string;
  skipWelcome?: boolean;
  websiteURL?: string;
  username?: string;
};

export type BlockedProps = {
  status: FriendStatus;
  blocker: string;
};

export type UserMetric = {
  totalExperiences: number;
  totalFriends: number;
  totalKudos: number;
  totalPosts: number;
  totalActivity: number;
};

export interface Importer extends UserProps, BaseModel {}

export interface User extends UserProps, BaseModel {
  nonce?: number;
  currencies: Currency[];
  people?: People[];
  metric?: UserMetric;
  activityLogs?: ActivityLog[];
}

export interface UserTransactionDetail {
  sent: TransactionDetail[];
  received: TransactionDetail[];
}

export interface ActivityLog {
  id: string;
  type: ActivityLogType;
  message: string;
  userId: string;
}

export enum ActivityLogType {
  USERNAME = 'username',
  PROFILE = 'profile',
  SKIP = 'skip_new_user_username',
}
