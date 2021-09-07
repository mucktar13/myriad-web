import React from 'react';

import Link from 'next/link';

import {CardTitleProps} from './cardTitle.interface';
import {useStyles} from './cardTitle.style';

const CardTitle: React.FC<CardTitleProps> = ({text, url}) => {
  const style = useStyles();

  return (
    <Link href={url}>
      <a href={url} className={style.link} target="_blank" rel="noreferrer">
        {text}
      </a>
    </Link>
  );
};

export default CardTitle;
