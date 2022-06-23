import {MyriadAPI} from '../MyriadAPI.class';

import {
  User,
  UserTransactionDetail,
  ActivityLog,
  BlockedProps,
  ActivityLogType,
} from 'src/interfaces/user';
import {WalletDetail} from 'src/interfaces/wallet';
import {PAGINATION_LIMIT} from 'src/lib/api/constants/pagination';
import {BaseList} from 'src/lib/api/interfaces/base-list.interface';

type UserList = BaseList<User>;
type ActivityList = BaseList<ActivityLog>;

export class UserAPI {
  private readonly base: MyriadAPI;

  constructor(base: MyriadAPI) {
    this.base = base;
  }

  async getUserDetail(id: string, userId?: string): Promise<User & BlockedProps> {
    const params: Record<string, any> = {
      filter: {
        include: [
          {
            relation: 'people',
          },
          {
            relation: 'wallets',
            scope: {
              include: [
                {
                  relation: 'network',
                },
              ],
            },
          },
          {
            relation: 'activityLogs',
            scope: {
              where: {
                type: {
                  inq: [ActivityLogType.SKIP, ActivityLogType.USERNAME],
                },
              },
            },
          },
          {
            relation: 'wallets',
            scope: {
              where: {
                primary: true,
              },
            },
          },
        ],
      },
    };

    if (userId) {
      params.userId = userId;
    }

    const data = await this.base.request<User & BlockedProps>({
      url: `users/${id}`,
      method: 'GET',
      params,
    });

    return data;
  }

  async getUserByAddress(address: string[]): Promise<UserList> {
    const data = await this.base.request<UserList>({
      url: '/users',
      method: 'GET',
      params: {
        pageLimit: address.length,
        filter: {
          where: {
            id: {
              inq: address,
            },
          },
        },
      },
    });

    return data;
  }

  async createUser(values: Partial<User>): Promise<User> {
    const data = await this.base.request<User>({
      url: '/users',
      method: 'POST',
      data: values,
    });

    return data;
  }

  async updateUser(userId: string, values: Partial<User>): Promise<User> {
    const data = await this.base.request<User>({
      url: `/users/${userId}`,
      method: 'PATCH',
      data: values,
    });

    return data;
  }

  async searchUsers(page = 1, query?: string): Promise<UserList> {
    const params: Record<string, any> = {
      pageNumber: page,
      pageLimit: PAGINATION_LIMIT,
    };

    if (query) {
      params.name = query;
      params.sortBy = 'name';
      params.order = 'ASC';
      params.filter = {
        where: {
          deletedAt: {
            $exists: false,
          },
        },
      };
    }

    const data = await this.base.request<UserList>({
      url: '/users',
      method: 'GET',
      params,
    });

    return data;
  }

  async getUserTransactionDetail(id: string): Promise<UserTransactionDetail> {
    const data = await this.base.request<UserTransactionDetail>({
      url: `/users/${id}/transaction-summary`,
      method: 'GET',
    });

    return data;
  }

  async searchUsername(query: string): Promise<UserList> {
    const data = await this.base.request<UserList>({
      url: '/users',
      method: 'GET',
      params: {
        filter: {
          where: {
            username: query,
          },
        },
      },
    });

    return data;
  }

  async checkUsername(userId: string): Promise<ActivityList> {
    const data = await this.base.request<ActivityList>({
      url: '/activity-logs',
      method: 'GET',
      params: {
        filter: {
          where: {
            and: [{type: 'username'}, {userId}],
          },
        },
      },
    });

    return data;
  }

  async getUsername(username: string): Promise<boolean> {
    const data = await this.base.request<boolean>({
      url: `/username/${username}`,
      method: 'GET',
    });

    return data;
  }

  async getWalletAddress(userId: string): Promise<WalletDetail> {
    const data = await this.base.request<WalletDetail>({
      url: `/users/${userId}/walletaddress`,
      method: 'GET',
    });

    return data;
  }
}
