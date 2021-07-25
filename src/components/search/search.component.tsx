import React from 'react';

import {useRouter} from 'next/router';

import {Theme, createStyles, makeStyles} from '@material-ui/core/styles';

import SearchComponent from '../common/search.component';

type SearchProps = {
  value?: string;
  placeholder?: string;
};

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(1),
      maxWidth: '100%',
    },
    optionItem: {
      position: 'relative',
      flex: 1,
    },
    addButton: {
      position: 'absolute',
      top: 0,
      right: 0,
    },
  }),
);

const SearchUser: React.FC<SearchProps> = ({value, placeholder}) => {
  const router = useRouter();

  const handleSearch = (value: string) => {
    if (value) {
      router.push(`/search?q=${value}`);
    }
  };

  return <SearchComponent value={value} placeholder={placeholder} onSubmit={handleSearch} />;
};

export default SearchUser;
