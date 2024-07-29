import {
  ImageListProps,
  ImageListItemProps,
  GalleryType,
} from './Gallery.types';

import { generateImageSizes } from 'src/helpers/image';
import { Sizes } from 'src/interfaces/assets';

const horizontalGallery = (
  source: string[] | Sizes[],
  mobile: boolean,
): ImageListProps => {
  let listCols = 1;
  let itemCols = 1;
  let ROWS = 1;
  let cellHeight = mobile ? 260 : 320;

  const images: ImageListItemProps[] = [];

  for (let index = 0; index < source.length; index++) {
    if (source.length > 1) {
      listCols = 2;
      itemCols = 2;
    }

    if (source.length >= 3) {
      listCols = 6;
      cellHeight = mobile ? 130 : 160;
      ROWS = index === 0 ? 2 : 1;
      itemCols =
        index === 0 ? listCols : listCols / Math.min(source.length - 1, 3);
    }

    const sizes = generateImageSizes(source[index]);

    images.push({
      cols: itemCols,
      rows: ROWS,
      src: ROWS === 1 ? sizes.small : sizes.medium,
      sizes: sizes,
      loading: true,
    });
  }

  return {
    cols: listCols,
    cellHeight,
    images,
  };
};

const verticalGallery = (
  source: string[] | Sizes[],
  mobile: boolean,
): ImageListProps => {
  let listCols = 1;
  let ROWS = 1;
  let cellHeight = mobile ? 260 : 320;

  const images: ImageListItemProps[] = [];

  for (let index = 0; index < source.length; index++) {
    if (source.length > 1) {
      listCols = 2;
    }

    if (source.length >= 2) {
      cellHeight = mobile ? 130 : 162;
      ROWS = index === 0 ? 2 : 1;
    }

    const sizes = generateImageSizes(source[index]);

    images.push({
      cols: 1,
      rows: ROWS,
      src: ROWS === 1 ? sizes.small : sizes.medium,
      sizes: sizes,
      loading: true,
    });
  }

  return {
    cols: listCols,
    cellHeight,
    images,
  };
};

export const buildList = (
  source: string[] | Sizes[],
  variant: GalleryType,
  mobile = false,
): ImageListProps => {
  switch (variant) {
    case 'horizontal':
      return horizontalGallery(source, mobile);
    default:
      return verticalGallery(source, mobile);
  }
};
