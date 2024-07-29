import {
  ChatAltIcon,
  DuplicateIcon,
  ShareIcon,
} from '@heroicons/react/outline';

import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import getConfig from 'next/config';

import {
  TextField,
  Typography,
  InputAdornment,
  Hidden,
  IconButton,
} from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon';

import { PostFooterProps } from './Footer.interface';
import { useStyles } from './Footer.style';

import { Modal } from 'components/atoms/Modal';
import { Text } from 'components/atoms/Text';
import { VotingComponent } from 'components/atoms/Voting';
import { useEnqueueSnackbar } from 'components/common/Snackbar/useEnqueueSnackbar.hook';
import ShowIf from 'src/components/common/show-if.component';
import { formatCount } from 'src/helpers/number';
import i18n from 'src/locale';

const { publicRuntimeConfig } = getConfig();

export const PostFooter: React.FC<PostFooterProps> = props => {
  const style = useStyles();
  const {
    postId,
    metrics: { discussions = 0, debates = 0, upvotes = 0, downvotes = 0 },
    downvoted = false,
    upvoted = false,
    children,
    type = 'default',
    onShowComments,
    ...restProps
  } = props;

  const enqueueSnackbar = useEnqueueSnackbar();

  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const postUrl = `${publicRuntimeConfig.appAuthURL}/post/${postId}`;
  const embedUrl = `${publicRuntimeConfig.appAuthURL}/embed?id=${postId}&type=post`;

  const handleClickShareLink = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleLinkCopied = () => {
    setShareAnchorEl(null);
    enqueueSnackbar({
      message: i18n.t('Post_Share.Copy_URL_Message'),
      variant: 'success',
    });
  };

  const handleCloseCopyLink = () => {
    setShareAnchorEl(null);
  };

  return (
    <div className={style.root}>
      <VotingComponent
        isDownVoted={downvoted}
        isUpVoted={upvoted}
        variant="row"
        vote={upvotes - downvotes}
        {...restProps}
      />

      <div className={style.section}>
        <IconButton
          disabled={type === 'share'}
          onClick={onShowComments}
          className={style.action}
          color="primary">
          <SvgIcon
            classes={{ root: style.fill }}
            component={ChatAltIcon}
            viewBox="0 0 24 24"
          />
          <Typography
            component="span"
            color="primary"
            variant="body1"
            className={style.comment}>
            <Typography component="span" color="primary" variant="body1">
              {formatCount(discussions + debates)}
            </Typography>
            &nbsp;
            <Typography
              component="span"
              color="primary"
              variant="body1"
              className={style.commentLabel}>
              {i18n.t('Post_Detail.Post_Action.Comments')}
            </Typography>
          </Typography>
        </IconButton>
      </div>

      <ShowIf condition={type !== 'share'}>
        <div className={style.section}>
          <IconButton
            onClick={handleClickShareLink}
            className={style.action}
            color="primary">
            <SvgIcon
              className={style.mr1}
              classes={{ root: style.fill }}
              component={ShareIcon}
              viewBox="0 0 24 24"
            />
            <Hidden xsDown>
              <Text
                locale="Post_Share.Action"
                color="primary"
                variant="body1"
                weight="semi-bold"
              />
            </Hidden>
          </IconButton>
        </div>
      </ShowIf>

      {children}

      <Modal
        align="left"
        title={i18n.t('Post_Share.Title')}
        className={style.modal}
        open={Boolean(shareAnchorEl)}
        onClose={handleCloseCopyLink}>
        <div className={style.copy}>
          <Typography
            component="p"
            className={style.subtitle}
            color="primary"
            variant="h4">
            {i18n.t('Post_Share.Post_URL')}
          </Typography>
          <TextField
            label={i18n.t('Post_Share.Post_URL')}
            id="copy-post-url"
            value={postUrl}
            variant="outlined"
            disabled
            fullWidth
            margin="none"
            className={style.input}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CopyToClipboard text={postUrl} onCopy={handleLinkCopied}>
                    <IconButton
                      aria-label="copy-post-link"
                      style={{ padding: 0 }}>
                      <SvgIcon component={DuplicateIcon} color="primary" />
                    </IconButton>
                  </CopyToClipboard>
                </InputAdornment>
              ),
            }}
          />
          <div className={style.divider} />
          <Typography
            component="p"
            className={style.subtitle}
            color="primary"
            variant="h4">
            {i18n.t('Post_Share.Embed_Link')}
          </Typography>
          <TextField
            label={i18n.t('Post_Share.Embed_Link_PLaceholder')}
            id="copy-post-embed"
            value={`<iframe width="700" height="525" src="${embedUrl}></iframe>`}
            variant="outlined"
            disabled
            fullWidth
            multiline
            margin="none"
            className={style.multiline}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CopyToClipboard
                    text={`<iframe src="${embedUrl}"></iframe>`}
                    onCopy={handleLinkCopied}>
                    <IconButton
                      aria-label="copy-post-embed"
                      style={{ padding: 0 }}>
                      <SvgIcon component={DuplicateIcon} color="primary" />
                    </IconButton>
                  </CopyToClipboard>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </Modal>
    </div>
  );
};
