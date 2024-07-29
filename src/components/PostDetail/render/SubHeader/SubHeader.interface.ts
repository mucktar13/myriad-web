import { Experience } from 'src/interfaces/experience';
import { User } from 'src/interfaces/user';

export type PostSubheaderActionProps = {
  onShowImporters: () => void;
};

export type PostSubHeaderProps = PostSubheaderActionProps & {
  postId: string;
  platform: string;
  date: Date;
  importers?: User[];
  totalImporters: number;
  url: string;
  totalExperience: number;
  experiences?: Experience[];
};
