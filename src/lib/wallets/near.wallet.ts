import {BN, numberToHex} from '@polkadot/util';

import {
  BalanceCallback,
  TipResult,
  TipsBalanceInfo,
  WalletProviderInterface,
} from './wallet.interface';

import {connect, ConnectConfig, keyStores, Near, utils, WalletConnection} from 'near-api-js';
import {Currency} from 'src/interfaces/currency';

export class NearWallet implements WalletProviderInterface {
  protected observers: Array<BalanceCallback> = [];

  constructor(private readonly appName: string, private readonly networkId: string) {}

  async connection(): Promise<Near> {
    const config: ConnectConfig = {
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      networkId: this.networkId,
      nodeUrl: `https://rpc.${this.networkId}.near.org`,
      walletUrl: `https://wallet.${this.networkId}.near.org`,
      helperUrl: `https://helper.${this.networkId}.near.org`,
      headers: {},
    };

    return connect(config);
  }

  subscribe(callback: BalanceCallback): void {
    this.observers.push(callback);
  }

  async createSignature(nonce: number): Promise<string> {
    const near = await this.connection();

    const message = Buffer.from(numberToHex(nonce));

    const signature = await near.connection.signer.signMessage(message);

    return signature;
  }

  async estimateFee(): Promise<BN | string> {
    const near = await this.connection();

    const {sync_info} = await near.connection.provider.status();

    const gas = await near.connection.provider.gasPrice(sync_info.latest_block_hash);

    return utils.format.formatNearAmount(gas.gas_price);
  }

  async getBalance(): Promise<BN | string> {
    const near = await this.connection();

    const wallet = new WalletConnection(near, this.appName);

    const balance = await wallet.account().getAccountBalance();

    return utils.format.formatNearAmount(balance.available);
  }

  async sendTransaction(currency: Currency, from: string, to: string, amount: BN): Promise<void> {
    const near = await this.connection();

    const wallet = new WalletConnection(near, this.appName);
    const account = wallet.account();

    await account.sendMoney(to, amount);
  }

  async getTips(payload: TipsBalanceInfo): Promise<TipResult | null> {
    throw new Error('Not implemented');
  }

  async claimTip(payload: TipsBalanceInfo): Promise<void> {
    throw new Error('Not implemented');
  }
}
