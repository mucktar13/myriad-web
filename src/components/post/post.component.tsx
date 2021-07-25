import React, {useState, useRef, useEffect} from 'react';
import {FacebookProvider, EmbeddedPost} from 'react-facebook';
import ReactMarkdown from 'react-markdown';
import {useSelector} from 'react-redux';

import dynamic from 'next/dynamic';
import {useRouter} from 'next/router';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';

import {PostActionComponent} from './post-action.component';
import PostAvatarComponent from './post-avatar.component';
import PostImageComponent from './post-image.component';
import {PostOptionsComponent} from './post-options.component';
import {PostSubHeader} from './post-sub-header.component';
import PostVideoComponent from './post-video.component';
import {useStyles} from './post.style';

import remarkGFM from 'remark-gfm';
import remarkHTML from 'remark-html';
import CardTitle from 'src/components/common/CardTitle.component';
import SendTipModal from 'src/components/common/sendtips/SendTipModal';
import {useWalletAddress} from 'src/components/common/sendtips/use-wallet.hook';
import ShowIf from 'src/components/common/show-if.component';
import {useTipSummaryHook} from 'src/components/tip-summary/tip-summar.hook';
import {useSocialDetail} from 'src/hooks/use-social.hook';
import {BalanceDetail} from 'src/interfaces/balance';
import {ImageData} from 'src/interfaces/post';
import {Post} from 'src/interfaces/post';
import {Token} from 'src/interfaces/token';
import {WalletDetail} from 'src/interfaces/wallet';
import {RootState} from 'src/reducers';
import {UserState} from 'src/reducers/user/reducer';
import {v4 as uuid} from 'uuid';

const CommentComponent = dynamic(() => import('./comment/comment.component'));

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID as string;

type PostComponentProps = {
  defaultExpanded?: boolean;
  disable?: boolean;
  post: Post;
  postOwner?: boolean;
  balanceDetails: BalanceDetail[];
  availableTokens: Token[];
};

const PostComponent: React.FC<PostComponentProps> = ({
  balanceDetails,
  post,
  defaultExpanded = false,
  disable = false,
  postOwner,
  availableTokens,
}) => {
  const style = useStyles();
  const router = useRouter();
  const {user, anonymous} = useSelector<RootState, UserState>(state => state.userState);
  const {loading, detail} = useSocialDetail(post);

  const {openTipSummary} = useTipSummaryHook();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const {loadWalletDetails, walletDetails} = useWalletAddress(post.id);
  const [walletReceiverDetail, setWalletReceiverDetail] = useState<WalletDetail>();
  const headerRef = useRef<any>();
  const sendTipRef = useRef<any>();

  // TODO: move to send tips component
  const defineWalletReceiverDetail = () => {
    const tempWalletDetail = walletDetails.filter(walletDetail => {
      return walletDetail.postId === post.id;
    });
    setWalletReceiverDetail(tempWalletDetail[0]);
  };

  // TODO: move to send tips component
  useEffect(() => {
    loadWalletDetails();
    defineWalletReceiverDetail();
  }, [post.id]);

  if (loading || !detail || (!user && !anonymous)) return null;

  if (post.text === '[removed]' && post.platform === 'reddit') return null;

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const tipPostUser = (): void => {
    if (disable) {
      return;
    }

    sendTipRef.current.triggerSendTipModal();
  };

  const openContentSource = (): void => {
    if (!post.platformUser) {
      return;
    }

    const url = getPlatformUrl();

    switch (post.platform) {
      case 'myriad':
        router.push(post.platformUser.platform_account_id);
        break;
      default:
        window.open(url, '_blank');
        break;
    }
  };

  // TODO: move to url helper
  const getPlatformUrl = (): string => {
    let url = '';

    if (!post.platformUser) return url;

    switch (post.platform) {
      case 'twitter':
        url = `https://twitter.com/${post.platformUser.username}`;
        break;
      case 'reddit':
        url = `https://reddit.com/user/${post.platformUser.username}`;
        break;
      case 'myriad':
        url = post.platformUser.platform_account_id;
        break;
      default:
        url = post.link || '';
        break;
    }

    return url;
  };

  const urlToImageData = (url: string): ImageData => {
    return {
      src: url,
      height: 400,
      width: 400,
    };
  };

  const handleTipSentSuccess = (postId: string) => {
    if (post.id === postId) {
      openTipSummary(post);
    }
  };

  const renderPostAvatar = () => {
    let avatarUrl: string = detail.user.avatar;

    if (post.platform === 'myriad' && post.platformUser?.platform_account_id === user?.id) {
      avatarUrl = user?.profilePictureURL as string;
    }

    return (
      <PostAvatarComponent origin={post.platform} avatar={avatarUrl} onClick={openContentSource} />
    );
  };

  const likePost = () => {
    console.log('liked Post!');
  };

  const dislikePost = () => {
    console.log('disliked Post!');
  };

  return (
    <>
      <Card className={style.root}>
        <CardHeader
          className={style.header}
          disableTypography
          ref={headerRef}
          avatar={renderPostAvatar()}
          action={<PostOptionsComponent postId={post.id} ownPost={postOwner || false} />}
          title={<CardTitle text={detail.user.name} url={getPlatformUrl()} />}
          subheader={
            <PostSubHeader
              date={detail.createdOn}
              importer={post.importer}
              platform={post.platform}
            />
          }
        />

        <ShowIf condition={['twitter', 'reddit'].includes(post.platform)}>
          <CardContent className={style.content}>
            <ShowIf condition={post.tags.length > 0}>
              <div>
                {post.tags.map(tag => (
                  <div style={{marginRight: 4, display: 'inline-block'}} key={uuid()}>
                    #{tag}
                  </div>
                ))}
              </div>
            </ShowIf>
            <ReactMarkdown remarkPlugins={[remarkGFM, remarkHTML]}>{detail.text}</ReactMarkdown>
            {detail.images && detail.images.length > 0 && (
              <PostImageComponent images={detail.images} />
            )}
            {detail.videos && detail.videos.length > 0 && (
              <PostVideoComponent url={detail.videos[0]} />
            )}
          </CardContent>
        </ShowIf>

        <ShowIf condition={post.platform === 'myriad'}>
          <CardContent className={style.content}>
            <Typography variant="body1" color="textPrimary" component="p">
              {detail.text}
            </Typography>
            {post.assets && post.assets.length > 0 && (
              <PostImageComponent images={post.assets.map(urlToImageData)} />
            )}
          </CardContent>
        </ShowIf>

        <ShowIf condition={post.platform === 'facebook'}>
          <CardContent className={style.content}>
            <FacebookProvider appId={FACEBOOK_APP_ID}>
              <EmbeddedPost href={post.link} width="700" />
            </FacebookProvider>
          </CardContent>
        </ShowIf>

        <CardActions disableSpacing className={style.action}>
          <PostActionComponent
            post={post}
            detail={detail}
            expandComment={handleExpandClick}
            commentExpanded={expanded}
            likePost={likePost}
            dislikePost={dislikePost}
            tipOwner={tipPostUser}
          />
        </CardActions>

        <ShowIf condition={expanded}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent className={style.reply}>
              <CommentComponent
                post={post}
                disableReply={disable}
                hide={handleExpandClick}
                balanceDetails={balanceDetails}
                availableTokens={availableTokens}
              />
            </CardContent>
          </Collapse>
        </ShowIf>
      </Card>

      {user && walletReceiverDetail && (
        <SendTipModal
          availableTokens={availableTokens}
          success={postId => handleTipSentSuccess(postId)}
          userAddress={user.id}
          ref={sendTipRef}
          postId={post.id as string}
          balanceDetails={balanceDetails}
          walletReceiverDetail={walletReceiverDetail}
        />
      )}
    </>
  );
};

export default PostComponent;
