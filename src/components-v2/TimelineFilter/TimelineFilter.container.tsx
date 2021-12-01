import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {useQueryParams} from '../../hooks/use-query-params.hooks';
import {parseQueryToFilter} from '../Timeline/helper';
import {useTimelineFilter} from '../Timeline/hooks/use-timeline-filter.hook';
import {TimelineFilter as TimelineFilterComponent} from './TimelineFilter';

import {ParsedUrlQuery} from 'querystring';
import {TimelineFilter, TimelineSortMethod, TimelineType} from 'src/interfaces/timeline';
import {User} from 'src/interfaces/user';
import {RootState} from 'src/reducers';
import {clearTimeline} from 'src/reducers/timeline/actions';

type TimelineFilterContainerProps = {
  filters?: TimelineFilter;
  enableFilter?: boolean;
  sortType?: 'metric' | 'filter';
  anonymous?: boolean;
};

export const TimelineFilterContainer: React.FC<TimelineFilterContainerProps> = props => {
  const {enableFilter, sortType, filters} = props;

  const dispatch = useDispatch();
  const {filterByOrigin} = useTimelineFilter(filters);
  const {query, push} = useQueryParams();

  const user = useSelector<RootState, User | undefined>(state => state.userState.user);
  const [timelineType, setTimelineType] = useState<TimelineType>(TimelineType.ALL);
  const [timelineSort, setTimelineSort] = useState<TimelineSortMethod>('created');

  useEffect(() => {
    parseFilter(query);
  }, [query]);

  const parseFilter = (query: ParsedUrlQuery) => {
    const filter = parseQueryToFilter(query);

    setTimelineType(filter.type);
    setTimelineSort(filter.sort);
  };

  const handleSortTimeline = (sort: TimelineSortMethod) => {
    push('sort', sort);
  };

  const handleFilterTimeline = (type: TimelineType) => {
    dispatch(clearTimeline());

    push('type', type, true);
  };

  return (
    <>
      <TimelineFilterComponent
        user={user}
        type={timelineType}
        sort={timelineSort}
        sortType={sortType}
        enableFilter={enableFilter}
        sortTimeline={handleSortTimeline}
        filterTimeline={handleFilterTimeline}
        filterOrigin={filterByOrigin}
      />
    </>
  );
};
