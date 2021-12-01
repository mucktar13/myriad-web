import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import {useRouter} from 'next/router';

import {PostDetail} from '../PostDetail';
import {Button, ButtonSize, ButtonVariant} from '../atoms/Button';
import {useStyles} from './Timeline.styles';
import {TimelineEmpty as TimelineEmptyComponent} from './TimelineEmpty';

import {Loading} from 'src/components-v2/atoms/Loading';
import {Comment} from 'src/interfaces/comment';
import {Post} from 'src/interfaces/post';
import {TimelineType} from 'src/interfaces/timeline';
import {User} from 'src/interfaces/user';

type TimelineProps = {
  user?: User;
  timelineType?: TimelineType;
  posts: Post[];
  anonymous: boolean;
  hasMore: boolean;
  upvote: (refrence: Post | Comment) => void;
  loadNextPage: () => void;
  onSendTip: (post: Post) => void;
  onOpenTipHistory: (post: Post) => void;
  onDelete: (post: Post) => void;
  onReport: (post: Post) => void;
  toggleDownvoting: (reference: Post | Comment | null) => void;
  onShared: (post: Post, type: 'link' | 'post') => void;
  onRemoveVote: (reference: Post | Comment) => void;
};

export const Timeline: React.FC<TimelineProps> = props => {
  const {
    user,
    timelineType,
    posts,
    anonymous,
    hasMore,
    loadNextPage,
    upvote,
    onSendTip,
    onOpenTipHistory,
    onDelete,
    onReport,
    onShared,
    toggleDownvoting,
    onRemoveVote,
  } = props;

  const router = useRouter();

  const handleCreateExperience = () => {
    router.push('/experience/create');
  };

  const styles = useStyles();

  return (
    <div className={styles.root}>
      <InfiniteScroll
        scrollableTarget="scrollable-timeline"
        dataLength={posts.length}
        hasMore={hasMore}
        next={loadNextPage}
        loader={<Loading />}>
        {timelineType === TimelineType.EXPERIENCE && posts.length === 0 ? (
          <TimelineEmptyComponent
            title={'No Experience posts yet'}
            subtitle={'Create your own timeline experience and see only posts which interest you'}
            iconPath={'/images/Empty_experience_post_illustration.svg'}
            width={90}
            height={90}
            action={
              <Button
                variant={ButtonVariant.CONTAINED}
                size={ButtonSize.SMALL}
                onClick={handleCreateExperience}>
                Create experience
              </Button>
            }
          />
        ) : timelineType === TimelineType.FRIEND && posts.length === 0 ? (
          <TimelineEmptyComponent
            title={'No posts from friends yet'}
            subtitle={'let’s make friends and you might get some valuable insights'}
            iconPath={'/images/Empty_friend_post_illustration.svg'}
            width={90}
            height={90}
          />
        ) : (
          posts.map(post => (
            <PostDetail
              user={user}
              key={`post-${post.id}`}
              post={post}
              anonymous={anonymous}
              onUpvote={upvote}
              onSendTip={onSendTip}
              toggleDownvoting={toggleDownvoting}
              onOpenTipHistory={onOpenTipHistory}
              onDelete={onDelete}
              onReport={onReport}
              onShared={onShared}
              onRemoveVote={onRemoveVote}
            />
          ))
        )}
      </InfiniteScroll>
    </div>
  );
};
