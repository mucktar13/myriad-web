import MyriadAPI from './base';
import { PAGINATION_LIMIT } from './constants/pagination';
import { BaseList } from './interfaces/base-list.interface';
import { PaginationParams } from './interfaces/pagination-params.interface';

import {
  Transaction,
  TransactionProps,
  TransactionInfo,
} from 'src/interfaces/transaction';

type TransactionList = BaseList<Transaction>;

export const storeTransaction = async (
  values: TransactionProps,
): Promise<Transaction> => {
  const { data } = await MyriadAPI().request<Transaction>({
    url: '/user/transactions',
    method: 'POST',
    data: values,
  });

  return data;
};

export const getTransactions = async (
  options: Partial<TransactionProps>,
  pagination: PaginationParams,
): Promise<TransactionList> => {
  const {
    page = 1,
    limit = PAGINATION_LIMIT,
    orderField = 'createdAt',
    sort = 'DESC',
  } = pagination;

  let status: string | null = null;
  const include: Array<any> = [
    {
      relation: 'currency',
      scope: {
        include: [{ relation: 'network' }],
      },
    },
    {
      relation: 'fromUser',
    },
    {
      relation: 'toUser',
    },
  ];

  if (options.to && options.to !== options.from) {
    status = 'received';
  }

  if (options.from && options.from !== options.to) {
    status = 'sent';
  }

  const { data } = await MyriadAPI().request<TransactionList>({
    url: '/user/transactions',
    method: 'GET',
    params: {
      pageNumber: page,
      pageLimit: limit,
      referenceType: options.type,
      referenceId: options.referenceId,
      currencyId: options.currencyId,
      status,
      filter: {
        order: [`${orderField} ${sort}`],
        include,
      },
    },
  });

  return data;
};

export const updateTransaction = async (
  transactionInfo: TransactionInfo,
): Promise<void> => {
  await MyriadAPI().request({
    url: `/user/transactions`,
    method: 'PATCH',
    data: transactionInfo,
  });
};
