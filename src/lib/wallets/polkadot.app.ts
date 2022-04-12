import {InjectedAccountWithMeta} from '@polkadot/extension-inject/types';
import Keyring from '@polkadot/keyring';
import {Signer} from '@polkadot/types/types';
import {numberToHex} from '@polkadot/util';

export class PolkadotApp {
  constructor(private readonly name: string) {}

  async getAccounts(): Promise<InjectedAccountWithMeta[]> {
    const {web3Enable, web3Accounts} = await import('@polkadot/extension-dapp');
    const extensions = await web3Enable(this.name);

    if (extensions.length === 0) {
      throw new Error('No extension found');
    }

    return web3Accounts();
  }

  async getAccount(wallet: string): Promise<InjectedAccountWithMeta | null> {
    const accounts = await this.getAccounts();

    const keyring = new Keyring();
    const address = keyring.encodeAddress(wallet);

    return accounts.find(account => account.address === address) ?? null;
  }

  async getSigner(account: InjectedAccountWithMeta): Promise<Signer> {
    const {web3FromSource} = await import('@polkadot/extension-dapp');

    const injector = await web3FromSource(account.meta.source);

    return injector.signer;
  }

  async createSignature(wallet: string, nonce: number): Promise<string> {
    const account = await this.getAccount(wallet);

    if (!account) throw new Error(`Account not found for ${wallet} wallet`);

    const signer = await this.getSigner(account);

    if (!signer.signRaw) throw new Error(`No signer`);

    const {signature} = await signer.signRaw({
      address: account.address,
      data: numberToHex(nonce),
      type: 'bytes',
    });

    return signature;
  }
}
