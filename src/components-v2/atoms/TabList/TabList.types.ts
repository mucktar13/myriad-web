import React from 'react';

export type TabListItem<T> = {
  id: T;
  title?: string;
  icon?: string | React.ReactElement;
};

export type TabPosition = 'left' | 'right' | 'center' | 'space-around' | 'space-evenly';

export type TabMark = 'underline' | 'cover';

export type TabSize = 'small' | 'medium';
