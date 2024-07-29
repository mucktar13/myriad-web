import * as React from 'react';

import LinkifyComponent from 'src/components/common/Linkify.component';

type RenderTwitterProps = {
  text: string;
  onHashtagClicked: (hashtag: string) => void;
};

export const RenderTwitter: React.FC<RenderTwitterProps> = props => {
  const { text, onHashtagClicked } = props;

  return (
    <div style={{ paddingBottom: 6 }}>
      <LinkifyComponent
        text={text}
        handleClick={onHashtagClicked}
        variant="body1"
        color="textPrimary"
        gutterBottom
      />
    </div>
  );
};

export default RenderTwitter;
