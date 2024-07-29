import React, { useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { Button, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

import { PromptComponent } from '../atoms/Prompt/prompt.component';
import MobilePostCreate from './MobilePostCreate';
import MobilePostImport from './MobilePostImport';

import useConfirm from 'components/common/Confirm/use-confirm.hook';
import { useEnqueueSnackbar } from 'components/common/Snackbar/useEnqueueSnackbar.hook';
import { Post } from 'src/interfaces/post';
import { User } from 'src/interfaces/user';
import { PostImportError } from 'src/lib/api/errors/post-import.error';
import { getCountPost } from 'src/lib/api/user';
import i18n from 'src/locale';
import { RootState } from 'src/reducers';
import { loadUsers, searchUsers } from 'src/reducers/search/actions';
import { createPost, importPost } from 'src/reducers/timeline/actions';

type PostCreateContainerType = {
  open: boolean;
  imported?: boolean;
  onClose: () => void;
};

const PostCreate = dynamic(() => import('./PostCreate'), { ssr: false });

export const PostCreateContainer: React.FC<PostCreateContainerType> = props => {
  const { open, onClose, imported } = props;
  const confirm = useConfirm();
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const enqueueSnackbar = useEnqueueSnackbar();
  const [redirect, setRedirect] = useState(false);

  const user = useSelector<RootState, User | null>(
    state => state.userState.user,
    shallowEqual,
  );
  const [dialogFailedImport, setDialogFailedImport] = useState({
    open: false,
    message: '',
    postId: '',
  });

  useEffect(() => {
    dispatch(loadUsers());
  }, []);
  useEffect(() => {
    if (redirect) {
      router.push({ pathname: `/post/${dialogFailedImport.postId}` });
    }
  }, [redirect]);

  const handleSearchPeople = useCallback(
    (query: string) => {
      if (user) {
        dispatch(searchUsers(query));
      }
    },
    [user],
  );

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

  const submitPost = useCallback(
    (
      post: string | Partial<Post>,
      attributes?: Pick<Post, 'NSFWTag' | 'visibility'>,
    ) => {
      if (typeof post === 'string') {
        dispatch(
          importPost(post, attributes, (error: PostImportError | null) => {
            if (error) {
              const { statusCode, message: postId } = error.getErrorData();
              if (statusCode === 422) {
                return confirm({
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
              }
              let message: string = error.message;
              if ([400, 403, 404, 409].includes(statusCode)) {
                message = i18n.t(
                  `Home.RichText.Prompt_Import.Error.${statusCode}`,
                );
                if (statusCode === 409) {
                  setDialogFailedImport({ open: true, message, postId });
                  setRedirect(true);
                  user.fullAccess
                    ? enqueueSnackbar({
                        message: message,
                        variant: 'success',
                      })
                    : _handlePostNotFullAccess();
                }
              }

              setDialogFailedImport({ open: true, message, postId });
            } else {
              user.fullAccess
                ? enqueueSnackbar({
                    message: i18n.t('Post_Import.Success_Toaster'),
                    variant: 'success',
                  })
                : _handlePostNotFullAccess();
            }
          }),
        );
      } else {
        dispatch(
          createPost(
            post,
            [],
            () => {
              user.fullAccess
                ? enqueueSnackbar({
                    message: i18n.t('Post_Create.Success_Toaster'),
                    variant: 'success',
                  })
                : _handlePostNotFullAccess();
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
          ),
        );
      }

      onClose();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  if (!redirect && isMobile && !imported) {
    return (
      <>
        <MobilePostCreate
          user={user}
          open={open}
          onClose={onClose}
          onSearchPeople={handleSearchPeople}
          onSubmit={submitPost}
          isMobile={isMobile}
        />
        <PromptComponent
          title={i18n.t('Home.RichText.Prompt_Import.Title')}
          subtitle={dialogFailedImport.message}
          open={dialogFailedImport.open}
          icon="warning"
          onCancel={() =>
            setDialogFailedImport({ ...dialogFailedImport, open: false })
          }>
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
            }}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() =>
                setDialogFailedImport({ ...dialogFailedImport, open: false })
              }>
              {i18n.t('General.OK')}
            </Button>
            {/* TODO: Added translation */}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() =>
                router.push({ pathname: `/post/${dialogFailedImport.postId}` })
              }>
              See post
            </Button>
          </div>
        </PromptComponent>
      </>
    );
  }
  if (!redirect && isMobile && imported) {
    return (
      <>
        <MobilePostImport
          user={user}
          open={open}
          onClose={onClose}
          onSearchPeople={handleSearchPeople}
          onSubmit={submitPost}
          isMobile={isMobile}
        />
        <PromptComponent
          title={i18n.t('Home.RichText.Prompt_Import.Title')}
          subtitle={dialogFailedImport.message}
          open={dialogFailedImport.open}
          icon="warning"
          onCancel={() =>
            setDialogFailedImport({ ...dialogFailedImport, open: false })
          }>
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
            }}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() =>
                setDialogFailedImport({ ...dialogFailedImport, open: false })
              }>
              {i18n.t('General.OK')}
            </Button>
            {/* TODO: Added translation */}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() =>
                router.push({ pathname: `/post/${dialogFailedImport.postId}` })
              }>
              See post
            </Button>
          </div>
        </PromptComponent>
      </>
    );
  }

  if (!user) return null;
  if (!redirect) {
    return (
      <>
        <PostCreate
          user={user}
          open={open}
          onClose={onClose}
          onSearchPeople={handleSearchPeople}
          onSubmit={submitPost}
          isMobile={isMobile}
        />
        <PromptComponent
          title={i18n.t('Home.RichText.Prompt_Import.Title')}
          subtitle={dialogFailedImport.message}
          open={dialogFailedImport.open}
          icon="warning"
          onCancel={() =>
            setDialogFailedImport({ ...dialogFailedImport, open: false })
          }>
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
            }}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() =>
                setDialogFailedImport({ ...dialogFailedImport, open: false })
              }>
              {i18n.t('General.OK')}
            </Button>
            {/* TODO: Added translation */}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() =>
                router.push({ pathname: `/post/${dialogFailedImport.postId}` })
              }>
              See post
            </Button>
          </div>
        </PromptComponent>
      </>
    );
  } else {
    return null;
  }
};

export default PostCreateContainer;
