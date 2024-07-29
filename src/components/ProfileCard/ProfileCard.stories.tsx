import { ComponentStory, ComponentMeta } from '@storybook/react';

import React from 'react';

import { ProfileCard as ProfileCardComponent } from '.';
import { AvatarSize } from '../atoms/Avatar';

export default {
  title: 'UI Revamp v2.0/components/Profile Card',
  component: ProfileCardComponent,
  argTypes: {
    size: {
      options: [AvatarSize.SMALL, AvatarSize.MEDIUM, AvatarSize.LARGE],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof ProfileCardComponent>;

const Template: ComponentStory<typeof ProfileCardComponent> = args => (
  <ProfileCardComponent {...args} />
);

export const ProfileCard = Template.bind({});
ProfileCard.args = {};
