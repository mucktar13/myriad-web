import {useState} from 'react';

import {useSearchContext, SearchActionType} from 'src/components/search/search.context';
import {User} from 'src/interfaces/user';
import * as UserAPI from 'src/lib/api/user';

type useSearchProps = {
  error: string | null;
  loading: boolean;
  results: User[];
  search: (query: string) => void;
};

export const useSearch = (): useSearchProps => {
  const {
    state: {results},
    dispatch,
  } = useSearchContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query: string) => {
    if (query.length > 0) {
      setLoading(true);

      try {
        const users = await UserAPI.search(query);

        dispatch({
          type: SearchActionType.LOAD_USER,
          payload: users,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    error,
    loading,
    results,
    search,
  };
};
