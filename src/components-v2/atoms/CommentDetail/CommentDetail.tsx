import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';

import {CommentEditor} from '../CommentEditor';
import {CommentList} from '../CommentList';
import {VotingComponent} from '../Voting';
import {CommentDetailProps} from './CommentDetail.interface';
import {useStyles} from './CommentDetail.styles';
import {CommentRender} from './CommentRender';

import {formatDistance, subDays} from 'date-fns';
import ShowIf from 'src/components/common/show-if.component';
import {acronym} from 'src/helpers/string';
import {CommentProps} from 'src/interfaces/comment';
import {ReferenceType, SectionType} from 'src/interfaces/interaction';
import {RootState} from 'src/reducers';
import {BalanceState} from 'src/reducers/balance/reducer';
import {setTippedContent} from 'src/reducers/timeline/actions';

export const CommentDetail: React.FC<CommentDetailProps> = props => {
  const {
    section,
    comment,
    deep,
    user,
    mentionables,
    onDownVote,
    onUpvote,
    onReply,
    onLoadReplies,
    onOpenTipHistory,
    onReport,
    onSendTip,
    onSearchPeople,
    setDownvoting,
    onBeforeDownvote,
  } = props;

  const dispatch = useDispatch();

  const {balanceDetails} = useSelector<RootState, BalanceState>(state => state.balanceState);
  const editorRef = useRef<HTMLDivElement>(null);

  const style = useStyles();

  const [isReplying, setIsReplying] = React.useState(false);

  useEffect(() => {
    handleLoadReplies();
  }, [comment]);

  const handleOpenReply = () => {
    setIsReplying(!isReplying);
  };

  const handleLoadReplies = () => {
    onLoadReplies(comment.id, deep);
  };

  const handleDownVote = () => {
    if (section === SectionType.DEBATE) {
      setDownvoting(comment);

      if (deep < 2) {
        handleOpenReply();
      }

      if (deep >= 2) {
        onBeforeDownvote && onBeforeDownvote();
      }
    } else {
      onDownVote(comment);
    }
  };

  const handleUpvote = () => {
    onUpvote(comment);
  };

  const handleOpenTipHistory = () => {
    onOpenTipHistory(comment);
  };

  const handleReport = () => {
    onReport(comment);
  };

  const handleSendTip = () => {
    onSendTip(comment);
    const contentType = 'comment';
    const referenceId = comment.id;
    dispatch(setTippedContent(contentType, referenceId));
  };

  const handleSendReply = (attributes: Partial<CommentProps>) => {
    setIsReplying(false);

    onReply(attributes);
  };

  const getDate = (commentDate: Date) => {
    const newFormat = formatDistance(subDays(new Date(commentDate), 0), new Date(), {
      addSuffix: true,
    });
    return newFormat;
  };

  const totalVote = () => {
    return comment.metric.upvotes - comment.metric.downvotes;
  };

  const owner = comment.userId === user?.id;

  return (
    <div className={style.flex}>
      <div className={style.tree}>
        <Avatar className={style.avatar} src={comment.user?.profilePictureURL || ''}>
          {acronym(comment.user?.name)}
        </Avatar>
        {deep !== 2 && comment.replies && <div className={style.verticalTree} />}
        {deep !== 0 && <div className={style.horizontalTree} />}
      </div>
      <div className={style.fullWidth}>
        <Card className={style.comment}>
          <CardHeader
            title={
              <Typography className={style.text}>
                {comment.user.name}
                <span className={style.subText}>
                  <span className={style.dot}>•</span>
                  {getDate(comment.createdAt)}
                </span>
              </Typography>
            }
          />
          <CardContent className={style.content}>
            <CommentRender comment={comment} max={180} onShowAll={console.log} />
          </CardContent>

          <CardActions disableSpacing>
            <VotingComponent
              isUpVote={Boolean(comment.isUpvoted)}
              isDownVote={Boolean(comment.isDownVoted)}
              variant="row"
              vote={totalVote()}
              size="small"
              onDownVote={handleDownVote}
              onUpvote={handleUpvote}
            />
            {deep < 2 && (
              <Button
                onClick={handleOpenReply}
                classes={{root: style.button}}
                size="small"
                variant="text">
                Reply
              </Button>
            )}

            {
              // hide button if it's owner's post or balance is not yet loaded
            }
            <ShowIf condition={owner || balanceDetails.length === 0}>
              <></>
            </ShowIf>

            <ShowIf condition={!owner}>
              <Button
                disabled={balanceDetails.length === 0}
                classes={{root: style.button}}
                size="small"
                variant="text"
                onClick={handleSendTip}>
                Send tip
              </Button>
            </ShowIf>

            <Button
              classes={{root: style.button}}
              size="small"
              variant="text"
              onClick={handleOpenTipHistory}>
              Tip history
            </Button>
            <Button
              classes={{root: style.button}}
              size="small"
              variant="text"
              onClick={handleReport}>
              Report
            </Button>
          </CardActions>
        </Card>

        {user && isReplying && (
          <CommentEditor
            ref={editorRef}
            referenceId={comment.id}
            type={ReferenceType.COMMENT}
            user={user}
            mentionables={mentionables.map(item => ({
              value: item.id,
              name: item.name,
              avatar: item.avatar,
            }))}
            onSearchMention={onSearchPeople}
            onSubmit={handleSendReply}
          />
        )}

        {comment && (
          <CommentList
            section={section}
            user={user}
            deep={deep + 1}
            onUpvote={onUpvote}
            onDownvote={onDownVote}
            comments={comment.replies || []}
            onComment={onReply}
            onLoadReplies={onLoadReplies}
            onOpenTipHistory={onOpenTipHistory}
            onReport={onReport}
            onSendTip={onSendTip}
            mentionables={mentionables}
            onSearchPeople={onSearchPeople}
            setDownvoting={setDownvoting}
            onBeforeDownvote={handleOpenReply}
          />
        )}
      </div>
    </div>
  );
};
