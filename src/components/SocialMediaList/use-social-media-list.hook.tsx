import React, { useMemo } from 'react';

import { socials as socialsIcons } from 'src/components/atoms/Icons';
import { SocialsEnum, SocialMedia } from 'src/interfaces/social';

export type SocialDetail = {
  id: SocialsEnum;
  icon: React.ReactElement | React.FC;
  originId: string | null;
  connected: boolean;
  username: string | null;
};

function enumKeys<E>(e: E): (keyof E)[] {
  return Object.keys(e) as (keyof E)[];
}

export const useSocialMediaList = (
  connected: SocialMedia[],
): SocialDetail[] => {
  const socials: SocialDetail[] = [];

  const icons: Partial<Record<SocialsEnum, JSX.Element>> = useMemo(
    () => ({
      [SocialsEnum.REDDIT]: socialsIcons[SocialsEnum.REDDIT],
      [SocialsEnum.TWITTER]: socialsIcons[SocialsEnum.TWITTER],
    }),
    [],
  );

  const getPrimaryAccount = (social: SocialsEnum): SocialMedia | null => {
    let match = connected.find(
      item => item.platform === social && item.primary,
    );

    if (!match) {
      match = connected.find(item => item.platform === social);
    }

    return match ?? null;
  };

  for (const key of enumKeys(SocialsEnum)) {
    const social: SocialsEnum = SocialsEnum[key];

    if (!icons[social]) continue;

    const item = getPrimaryAccount(social);

    socials.push({
      id: social,
      icon: icons[social] as JSX.Element,
      originId: item?.people?.originUserId ?? null,
      connected: !!item && item.verified,
      username: item?.people?.username ?? null,
    });
  }

  return socials;
};
