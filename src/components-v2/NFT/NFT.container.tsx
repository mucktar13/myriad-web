import React from 'react';

import Typography from '@material-ui/core/Typography';

import {useStyles} from './nft.style';

import {TopNavbarComponent, SectionTitle} from 'src/components-v2/atoms/TopNavbar';
import Illustration from 'src/images/NFT_Isometric_1.svg';

const NFTContainer: React.FC = () => {
  const style = useStyles();
  return (
    <div>
      <div className={style.mb}>
        <TopNavbarComponent description={'Underway'} sectionTitle={SectionTitle.NFT} />
      </div>
      <div className={style.emptyUser}>
        <div className={style.illustration}>
          <Illustration />
        </div>
        <Typography className={style.text}>
          NFT is underway!{' '}
          <span aria-label="hands-up" role="img">
            🙌
          </span>
        </Typography>
        <Typography className={style.text2}>We will let you know very soon</Typography>
      </div>
    </div>
  );
};

export default NFTContainer;
