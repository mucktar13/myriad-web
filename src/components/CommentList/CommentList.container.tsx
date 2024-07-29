import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import dynamic from 'next/dynamic';

import useConfirm from '../common/Confirm/use-confirm.hook';
import { CommentList } from './CommentList';

import debounce from 'lodash/debounce';
import { ReportContainer } from 'src/components/Report';
import ShowIf from 'src/components/common/show-if.component';
import { useBlockList } from 'src/hooks/use-blocked-list.hook';
import { useCommentHook } from 'src/hooks/use-comment.hook';
import { Comment, CommentProps } from 'src/interfaces/comment';
import { ReferenceType, SectionType, Vote } from 'src/interfaces/interaction';
import { Post } from 'src/interfaces/post';
import { User } from 'src/interfaces/user';
import { getCountPost } from 'src/lib/api/user';
import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import { searchUsers } from 'src/reducers/search/actions';
import { downvote, removeVote, upvote } from 'src/reducers/timeline/actions';

const CommentEditor = dynamic(
  () => import('../CommentEditor/CommentEditor.container'),
  {
    ssr: false,
  },
);

type CommentListContainerProps = {
  user?: User;
  referenceId: string;
  type: ReferenceType;
  placeholder?: string;
  section: SectionType;
  focus?: boolean;
  expand?: boolean;
  scrollToPost: () => void;
};

export const CommentListContainer: React.FC<CommentListContainerProps> =
  props => {
    const {
      placeholder,
      referenceId,
      type,
      section,
      focus,
      expand,
      user,
      scrollToPost,
    } = props;
    const dispatch = useDispatch();
    const confirm = useConfirm();
    const {
      comments,
      hasMoreComment,
      loadInitComment,
      reply,
      updateDownvote,
      loadMoreComment,
      updateUpvote,
      updateRemoveUpvote,
      remove,
    } = useCommentHook(referenceId);
    const { blockedUserIds } = useBlockList(user);

    const anonymous = useSelector<RootState, boolean>(
      state => state.userState.anonymous,
      shallowEqual,
    );
    const downvoting = useSelector<RootState, Post | Comment | null>(
      state => state.timelineState.interaction.downvoting,
      shallowEqual,
    );
    const [reported, setReported] = useState<Comment | null>(null);
    const banned = Boolean(user?.deletedAt);

    useEffect(() => {
      loadInitComment(section);
    }, [referenceId]);

    const _handlePostNotFullAccess = async () => {
      const response = await getCountPost();
      const count = response.count;
      if (count === 0) {
        confirm({
          title: i18n.t('LiteVersion.LimitTitlePost', { count }),
          description: i18n.t('LiteVersion.LimitDescPost'),
          icon: 'warning',
          confirmationText: i18n.t('General.Got_It'),
          cancellationText: i18n.t('LiteVersion.MaybeLater'),
          onConfirm: () => {
            undefined;
          },
          onCancel: () => {
            undefined;
          },
          hideCancel: true,
        });
      }
    };

    const handleSubmitComment = useCallback(
      (comment: Partial<CommentProps>) => {
        if (user) {
          const attributes: CommentProps = {
            ...comment,
            postId: referenceId,
            referenceId: comment.referenceId ?? referenceId,
            type: comment.type ?? ReferenceType.POST,
            userId: user.id,
            section: comment.section ?? section,
          } as CommentProps;

          reply(
            user,
            attributes,
            () => {
              if (downvoting) {
                dispatch(
                  downvote(downvoting, section, (vote: Vote) => {
                    // update vote count if reference is a comment
                    if ('section' in downvoting) {
                      updateDownvote(
                        downvoting.id,
                        downvoting.metric.downvotes + 1,
                        vote,
                      );
                    }
                  }),
                );
              }
            },
            () => {
              confirm({
                title: i18n.t('LiteVersion.LimitTitlePost', { count: 0 }),
                description: i18n.t('LiteVersion.LimitDescPost'),
                icon: 'warning',
                confirmationText: i18n.t('General.Got_It'),
                cancellationText: i18n.t('LiteVersion.MaybeLater'),
                onConfirm: () => {
                  undefined;
                },
                onCancel: () => {
                  undefined;
                },
                hideCancel: true,
              });
            },
          );

          !user.fullAccess && _handlePostNotFullAccess();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
      [],
    );

    const handleUpdateDownvote = useCallback(
      (commentId: string, total: number, vote: Vote) => {
        updateDownvote(commentId, total, vote);
      },
      [],
    );

    const handleUpvote = useCallback((comment: Comment) => {
      if (comment.isUpvoted) {
        handleRemoveVote(comment);
      } else {
        dispatch(
          upvote(comment, section, (vote: Vote) => {
            updateUpvote(comment.id, comment.metric.upvotes + 1, vote);
          }),
        );
      }
    }, []);

    const handleRemoveVote = useCallback((comment: Comment) => {
      dispatch(
        removeVote(comment, () => {
          updateRemoveUpvote(comment.id);
        }),
      );
    }, []);

    const showConfirmDeleteDialog = (comment: Comment): void => {
      confirm({
        title: i18n.t('Post_Comment.Confirm_Delete.Title'),
        description: i18n.t('Post_Comment.Confirm_Delete.Description'),
        icon: 'danger',
        confirmationText: i18n.t('Post_Comment.Confirm_Delete.Confirm_Text'),
        cancellationText: i18n.t('Post_Comment.Confirm_Delete.Cancel_Text'),
        onConfirm: () => {
          remove(comment);
        },
      });
    };

    const handleReport = (comment: Comment) => {
      setReported(comment);
    };

    const closeReportPost = () => {
      setReported(null);
    };

    const handleSearchPeople = useCallback(
      () =>
        debounce((query: string) => {
          if (user) {
            dispatch(searchUsers(query));
          }
        }, 300),
      [],
    );

    const handleLoadMoreComment = (): void => {
      loadMoreComment(section);
    };

    return (
      <>
        <ShowIf condition={!anonymous && !banned}>
          <CommentEditor
            referenceId={referenceId}
            section={section}
            type={type}
            user={user}
            expand={expand}
            onSubmit={handleSubmitComment}
          />
        </ShowIf>

        <CommentList
          section={section}
          user={user}
          mentionables={[]}
          blockedUserIds={blockedUserIds}
          placeholder={placeholder}
          focus={focus}
          expand={expand}
          comments={comments || []}
          hasMoreComment={hasMoreComment}
          onLoadMoreComments={handleLoadMoreComment}
          onUpvote={handleUpvote}
          onRemoveVote={handleRemoveVote}
          onUpdateDownvote={handleUpdateDownvote}
          onReport={handleReport}
          onSearchPeople={handleSearchPeople}
          onDelete={showConfirmDeleteDialog}
          scrollToPost={scrollToPost}
        />

        <ReportContainer reference={reported} onClose={closeReportPost} />
      </>
    );
  };

export default CommentListContainer;
