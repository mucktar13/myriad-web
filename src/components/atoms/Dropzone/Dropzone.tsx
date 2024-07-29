import CameraIcon from '@heroicons/react/outline/CameraIcon';

import React, { useState } from 'react';
import { ErrorCode, FileError, useDropzone } from 'react-dropzone';

import { Button, capitalize, Typography, SvgIcon } from '@material-ui/core';

import { UploadIcon } from '../Icons';
import { useStyles } from './Dropzone.styles';
import MultipleImagePreview from './Render/PreviewImage/Multiple';
import SingleImagePreview from './Render/PreviewImage/Single';
import VideoPreview from './Render/PreviewVideo';

import { useEnqueueSnackbar } from 'components/common/Snackbar/useEnqueueSnackbar.hook';
import ShowIf from 'src/components/common/show-if.component';
import i18n from 'src/locale';

type DropzoneProps = {
  value?: string;
  type?: 'image' | 'video';
  width?: number;
  height?: number;
  border?: 'solid' | 'dashed';
  placeholder?: string;
  label?: string;
  loading?: boolean;
  accept?: string[];
  maxSize?: number;
  multiple?: boolean;
  usage?: string;
  error?: boolean;
  onImageSelected: (files: File[]) => void;
};

export const Dropzone: React.FC<DropzoneProps> = props => {
  const {
    onImageSelected,
    value,
    type = 'image',
    accept = ['image/jpeg', 'image/png'],
    maxSize = 20,
    loading = false,
    multiple = false,
    placeholder = i18n.t('Dropzone.Placeholder'),
    label = i18n.t('Dropzone.Btn_Upload'),
    usage = '',
    width,
    height,
  } = props;

  const styles = useStyles({ ...props, usage });
  const enqueueSnackbar = useEnqueueSnackbar();

  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>(value ? [value] : []);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept,
    maxSize: maxSize * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    multiple,
    onDrop: acceptedFiles => {
      let newFiles: File[] = acceptedFiles;

      if (multiple) {
        newFiles = [...files, ...acceptedFiles];
        setFiles(newFiles);
        setPreview(prevPreview => [
          ...prevPreview,
          ...acceptedFiles.map(URL.createObjectURL),
        ]);
      } else {
        setFiles(acceptedFiles);
        setPreview(acceptedFiles.map(URL.createObjectURL));
      }

      onImageSelected(newFiles);
    },
    onDropRejected: rejection => {
      enqueueSnackbar({
        message: getErrorMessage(rejection[0].errors[0]),
        variant: 'error',
      });
    },
  });

  const removeFile = (index: number) => {
    const currentFiles = files.filter((file, i) => index !== i);
    const currentPreview = preview.filter((url, i) => index !== i);

    setFiles(currentFiles);
    setPreview(currentPreview);

    onImageSelected(currentFiles);
  };

  const handleReuploadImage = () => {
    open();
  };

  // TODO: replace this by parsing label as prop
  const formatButtonLable = () => {
    if (usage == 'post') {
      if (type == 'video') {
        if (files.length > 0)
          return i18n.t('Dropzone.Btn_Replace_Video', {
            type: capitalize(type),
          });
        return i18n.t('Dropzone.Btn_Upload_Video', { type: capitalize(type) });
      } else return i18n.t('Dropzone.Btn_Add_Image');
    }

    if (!multiple && preview.length === 1) {
      if (usage === 'experience') return i18n.t('Dropzone.Btn.Exp_Change');
      return i18n.t('Dropzone.Btn_Reupload');
    }

    return label;
  };

  const getErrorMessage = (error: FileError): string => {
    if (error.code === ErrorCode.FileTooLarge) {
      return i18n.t('Dropzone.Error_File_Large', { maxSize });
    }

    return error.message;
  };

  return (
    <div className={styles.root}>
      <div
        {...getRootProps({ className: 'dropzone' })}
        className={styles.dropzone}>
        <input {...getInputProps()} />

        <ShowIf condition={type === 'image' && !multiple && preview.length > 0}>
          <SingleImagePreview
            loader={() => preview[0]}
            src={preview[0]}
            width={width}
            height={height}
            onClick={handleReuploadImage}
            style={{ cursor: 'pointer', borderRadius: 5 }}
          />
        </ShowIf>

        <ShowIf condition={type === 'image' && multiple && preview.length > 0}>
          <MultipleImagePreview
            files={preview}
            onRemoveFile={removeFile}
            disableRemove={loading}
          />
        </ShowIf>

        <ShowIf condition={type === 'video'}>
          <VideoPreview files={files} />
        </ShowIf>

        <ShowIf condition={preview.length === 0}>
          <ShowIf condition={usage === 'experience'}>
            <div className={styles.boxImage} onClick={handleReuploadImage}>
              <SvgIcon component={CameraIcon} viewBox="0 0 24 24" />
            </div>
          </ShowIf>
          <ShowIf condition={usage !== 'experience'}>
            <UploadIcon />
            <Typography className={styles.placeholder}>
              {placeholder}
            </Typography>
          </ShowIf>
        </ShowIf>

        {!loading && (
          <>
            <ShowIf condition={usage !== 'experience'}>
              <Button
                className={styles.button}
                size="small"
                variant={preview.length ? 'outlined' : 'contained'}
                color={value ? 'secondary' : 'primary'}
                onClick={handleReuploadImage}>
                {formatButtonLable()}
              </Button>
            </ShowIf>
            <ShowIf
              condition={
                usage === 'experience' &&
                label !== i18n.t('Dropzone.Btn_Upload')
              }>
              <Typography
                style={{ cursor: 'pointer', marginTop: 8 }}
                color="primary"
                variant="body1"
                onClick={handleReuploadImage}>
                {formatButtonLable()}
              </Typography>
            </ShowIf>
          </>
        )}
      </div>
    </div>
  );
};
