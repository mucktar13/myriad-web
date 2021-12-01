import {HYDRATE} from 'next-redux-wrapper';

import * as BaseConstants from '../base/constants';
import {PaginationState as BasePaginationState} from '../base/state';
import {Actions} from './actions';
import * as constants from './constants';

import update from 'immutability-helper';
import * as Redux from 'redux';
import {Comment} from 'src/interfaces/comment';
import {SectionType} from 'src/interfaces/interaction';
import {Post} from 'src/interfaces/post';
import {TimelineType, TimelineSortMethod, TimelineFilter} from 'src/interfaces/timeline';
import {WalletDetail} from 'src/interfaces/wallet';

export interface TimelineState extends BasePaginationState {
  type: TimelineType;
  sort: TimelineSortMethod;
  filter?: TimelineFilter;
  search?: string;
  hasMore: boolean;
  posts: Post[];
  tippedContent: {
    contentType: string;
    referenceId: string;
  };
  walletDetails: WalletDetail[];
  post?: Post;
  interaction: {
    downvoting: Post | Comment | null;
  };
}

const initalState: TimelineState = {
  loading: true,
  type: TimelineType.TRENDING,
  sort: 'created',
  hasMore: false,
  posts: [],
  tippedContent: {
    contentType: '',
    referenceId: '',
  },
  walletDetails: [],
  meta: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItemCount: 0,
    totalPageCount: 0,
  },
  interaction: {
    downvoting: null,
  },
};

export const TimelineReducer: Redux.Reducer<TimelineState, Actions> = (
  state = initalState,
  action,
) => {
  switch (action.type) {
    case HYDRATE: {
      return action.payload.timelineState;
    }

    case constants.LOAD_TIMELINE: {
      const {meta} = action.payload;

      return {
        ...state,
        posts:
          !meta.currentPage || meta.currentPage === 1
            ? action.payload.posts
            : [...state.posts, ...action.payload.posts],
        type: action.payload.type ?? state.type,
        sort: action.payload.sort ?? state.sort,
        filter: action.payload.filter ?? state.filter,
        hasMore: meta.currentPage < meta.totalPageCount,
        meta,
      };
    }

    case constants.ADD_POST_TO_TIMELINE: {
      return update(state, {
        posts: {$unshift: [action.post]},
      });
    }

    case constants.UPDATE_POST_PLATFORM_USER: {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.user.id === action.userId) {
            post.user = {
              ...post.user,
              ...action.user,
            };
          }

          return post;
        }),
      };
    }

    case constants.UPDATE_TIMELINE_FILTER: {
      return update(state, {
        filter: {
          $set: {
            ...state.filter,
            ...action.filter,
          },
        },
      });
    }

    case constants.CLEAR_TIMELINE: {
      return update(state, {
        loading: {$set: true},
        posts: {$set: []},
        filter: {$set: undefined},
      });
    }

    case constants.SET_DOWNVOTING: {
      return {
        ...state,
        interaction: {
          downvoting: action.reference,
        },
      };
    }

    case constants.LIKE_POST: {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId && post.metric) {
            post.metric.likes += 1;
            post.metric.dislikes = Math.max(0, post.metric.dislikes - 1);
            post.likes = [action.like];
          }

          return post;
        }),
      };
    }

    case constants.REMOVE_LIKE_POST: {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId && post.metric) {
            post.metric.likes = Math.max(0, post.metric.likes - 1);
            post.likes = post.likes
              ? post.likes.filter(like => like.referenceId !== action.postId && like.state)
              : [];
          }

          return post;
        }),
      };
    }

    case constants.DISLIKE_POST: {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId && post.metric) {
            post.metric.dislikes += 1;
            post.metric.likes = Math.max(0, post.metric.likes - 1);
            post.likes = [action.like];
          }

          return post;
        }),
      };
    }

    case constants.REMOVE_DISLIKE_POST: {
      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId && post.metric) {
            post.metric.dislikes = Math.max(0, post.metric.likes - 1);
            post.likes = post.likes
              ? post.likes.filter(like => like.referenceId !== action.postId && !like.state)
              : [];
          }

          return post;
        }),
      };
    }

    case constants.REMOVE_POST: {
      return {
        ...state,
        posts: state.posts.filter(post => {
          return post.id !== action.postId;
        }),
      };
    }

    case constants.FETCH_WALLET_DETAILS: {
      return {
        ...state,
        walletDetails: [...state.walletDetails, action.payload],
      };
    }

    case constants.FETCH_DEDICATED_POST: {
      return {
        ...state,
        post: action.post,
      };
    }

    case constants.UPVOTE_POST: {
      const post: Post | undefined = state.post;

      if (post && post.id === action.postId) {
        post.isUpvoted = true;
        post.isDownVoted = false;
        post.metric.upvotes = post.metric.upvotes + 1;

        // get previous downvote info
        const downvote = post.votes?.find(
          prevVote => !prevVote.state && prevVote.userId === action.vote.userId,
        );

        // if user has downvote, decrease count and replace with upvote
        if (post.votes && downvote) {
          post.metric.downvotes = post.metric.downvotes - 1;
          post.votes = [
            // get all votes not belong to current user
            ...post.votes.filter(prevVote => prevVote.userId !== action.vote.userId),
            // append upvote
            action.vote,
          ];
        } else {
          post.votes = post.votes ? [...post.votes, action.vote] : [action.vote];
        }
      }

      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId) {
            post.isUpvoted = true;
            post.isDownVoted = false;
            post.metric.upvotes = post.metric.upvotes + 1;

            // get previous downvote info
            const downvote = post.votes?.find(
              prevVote => !prevVote.state && prevVote.userId === action.vote.userId,
            );

            // if user has downvote, decrease count and replace with upvote
            if (post.votes && downvote) {
              post.metric.downvotes = post.metric.downvotes - 1;
              post.votes = [
                // get all votes not belong to current user
                ...post.votes.filter(prevVote => prevVote.userId !== action.vote.userId),
                // append upvote
                action.vote,
              ];
            } else {
              post.votes = post.votes ? [...post.votes, action.vote] : [action.vote];
            }
          }

          return post;
        }),
        post,
      };
    }

    case constants.DOWNVOTE_POST: {
      const post: Post | undefined = state.post;

      if (post && post.id === action.postId) {
        post.isDownVoted = true;
        post.isUpvoted = false;
        post.metric.downvotes = post.metric.downvotes + 1;

        // get previous downvote info
        const upvote = post.votes?.find(
          prevVote => prevVote.state && prevVote.userId === action.vote.userId,
        );

        // if user has upvote, decrease count and replace with downvote
        if (post.votes && upvote) {
          post.metric.upvotes = post.metric.upvotes - 1;
          post.votes = [
            // get all votes not belong to current user
            ...post.votes.filter(prevVote => prevVote.userId !== action.vote.userId),
            // append downvote
            action.vote,
          ];
        } else {
          post.votes = post.votes ? [...post.votes, action.vote] : [action.vote];
        }
      }

      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId) {
            post.isDownVoted = true;
            post.isUpvoted = false;
            post.metric.downvotes = post.metric.downvotes + 1;

            // get previous downvote info
            const upvote = post.votes?.find(
              prevVote => prevVote.state && prevVote.userId === action.vote.userId,
            );

            // if user has upvote, decrease count and replace with downvote
            if (post.votes && upvote) {
              post.metric.upvotes = post.metric.upvotes - 1;
              post.votes = [
                // get all votes not belong to current user
                ...post.votes.filter(prevVote => prevVote.userId !== action.vote.userId),
                // append downvote
                action.vote,
              ];
            } else {
              post.votes = post.votes ? [...post.votes, action.vote] : [action.vote];
            }
          }

          return post;
        }),
        post,
        interaction: {
          downvoting: null,
        },
      };
    }

    case constants.REMOVE_VOTE_POST: {
      const post: Post | undefined = state.post;

      if (post && post.id === action.postId) {
        if (post.isDownVoted) {
          post.metric.downvotes = post.metric.downvotes - 1;
        } else {
          post.metric.upvotes = post.metric.upvotes - 1;
        }

        post.isDownVoted = false;
        post.isUpvoted = false;
        post.votes = [];
      }

      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId) {
            if (post.isDownVoted) {
              post.metric.downvotes = post.metric.downvotes - 1;
            } else {
              post.metric.upvotes = post.metric.upvotes - 1;
            }

            post.isDownVoted = false;
            post.isUpvoted = false;
            post.votes = [];
          }

          return post;
        }),
        post,
        interaction: {
          downvoting: null,
        },
      };
    }

    case constants.SET_TIPPED_CONTENT: {
      return {
        ...state,
        tippedContent: {
          contentType: action.contentType,
          referenceId: action.referenceId,
        },
      };
    }

    case constants.INCREASE_COMMENT_COUNT: {
      const post: Post | undefined = state.post;

      if (post && post.id === action.postId) {
        if (action.section === SectionType.DEBATE) {
          post.metric.debates += 1;
        } else {
          post.metric.discussions += 1;
        }
      }

      return {
        ...state,
        posts: state.posts.map(post => {
          if (post.id === action.postId) {
            if (action.section === SectionType.DEBATE) {
              post.metric.debates += 1;
            } else {
              post.metric.discussions += 1;
            }
          }

          return post;
        }),
        post,
      };
    }

    case BaseConstants.ACTION_LOADING: {
      return update(state, {
        loading: {$set: action.loading},
      });
    }

    default: {
      return state;
    }
  }
};
