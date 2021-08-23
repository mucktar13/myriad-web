import {initialize} from './';

import {Comment, CommentProps} from 'src/interfaces/comment';

const table = 'comments';

export const addComment = (values: CommentProps): void => {
  const gun = initialize();

  gun.get<string>(table).put(values, err => {
    if (err) {
      console.log('ERROR', err);
    }
  });
};

export const getComment = (id: string): Promise<Comment[]> => {
  const gun = initialize();

  return new Promise(resolve => {
    gun
      .get(table)
      .get(id)
      .on(data => {
        resolve(data);
      });
  });
};
