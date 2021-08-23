import Gun from 'gun/gun';
import {IGunChainReference} from 'gun/types/chain';

let gun: IGunChainReference;

export const initialize = (peers?: string[]): IGunChainReference => {
  if (!gun) {
    gun = Gun({peers});
  }

  if (!gun && !peers) {
    throw new Error('Provide gun peers');
  }

  return gun;
};

export default initialize();
