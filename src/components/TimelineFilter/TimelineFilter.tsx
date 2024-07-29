import { GlobeAltIcon } from '@heroicons/react/outline';

import React from 'react';

import { Grid, SvgIcon, Typography } from '@material-ui/core';

import { DropdownMenu } from '../atoms/DropdownMenu';
import ShowIf from '../common/show-if.component';
import { useStyles } from './TimelineFilter.styles';
import { useFilterOption } from './hooks/use-filter-option.hook';

import { CustomFolderIcon } from 'components/Menu';
import { useQueryParams } from 'src/hooks/use-query-params.hooks';
import {
  TimelineType,
  TimelineOrderType,
  PostOriginType,
} from 'src/interfaces/timeline';
import { User } from 'src/interfaces/user';
import { SortType } from 'src/lib/api/interfaces/pagination-params.interface';
import i18n from 'src/locale';

export type TimelineFilterProps = {
  user?: User;
  filterType?: 'origin' | 'type';
  selectionType?: 'order' | 'sort';
  type: TimelineType;
  order: TimelineOrderType;
  originType: PostOriginType;
  sortTimeline: (sort: SortType) => void;
  orderTimeline: (order: TimelineOrderType) => void;
  filterTimeline?: (type: TimelineType) => void;
  filterOrigin?: (origin: PostOriginType) => void;
};

export const TimelineFilter: React.FC<TimelineFilterProps> = props => {
  const {
    user,
    order,
    originType,
    filterType,
    selectionType,
    sortTimeline,
    orderTimeline,
    filterOrigin,
  } = props;
  const styles = useStyles({ ...props, filterType });
  const { query } = useQueryParams();

  const { sortOptions, orderOptions, originFilterOptions } = useFilterOption();

  const handleFilterOrigin = (origin: PostOriginType) => {
    filterOrigin && filterOrigin(origin);
  };

  return (
    <Grid container alignItems="center" className={styles.root}>
      <ShowIf condition={filterType === 'type'}>
        <div className={styles.itemContainer}>
          <div>
            <SvgIcon
              component={
                query.type === 'all' || !user ? GlobeAltIcon : CustomFolderIcon
              }
            />
            <div className={styles.border}></div>
          </div>

          <Typography className={styles.text}>
            {query.type === 'all' || !user
              ? i18n.t('Experience.New.AllOfMyriad')
              : i18n.t('Experience.New.TimelineIFollow')}
          </Typography>
        </div>
      </ShowIf>

      <ShowIf condition={filterType === 'origin'}>
        <div className={styles.mobile}>
          <DropdownMenu<PostOriginType>
            title={i18n.t('Post_Sorting.Title_Filter')}
            selected={originType}
            options={originFilterOptions}
            onChange={handleFilterOrigin}
          />
        </div>
      </ShowIf>

      <ShowIf condition={selectionType === 'order'}>
        <DropdownMenu<TimelineOrderType>
          title={i18n.t('Post_Sorting.Title_Sort')}
          selected={order}
          options={orderOptions}
          onChange={orderTimeline}
        />
      </ShowIf>

      <ShowIf condition={selectionType === 'sort'}>
        <DropdownMenu<SortType>
          title={i18n.t('Post_Sorting.Title_Sort')}
          options={sortOptions}
          onChange={sortTimeline}
        />
      </ShowIf>
    </Grid>
  );
};
