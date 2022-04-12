import {options} from '@acala-network/api';
import {OrmlAccountData} from '@open-web3/orml-types/interfaces';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {u128, UInt} from '@polkadot/types';
import {BN} from '@polkadot/util';

import {PolkadotApp} from './polkadot.app';
import {
  BalanceCallback,
  WalletProviderInterface,
  TipsBalanceInfo,
  TipResult,
} from './wallet.interface';

import {random} from 'src/helpers/number';
import {Currency} from 'src/interfaces/currency';

export class PolkadotWallet implements WalletProviderInterface {
  protected observers: Array<BalanceCallback> = [];
  private readonly app: PolkadotApp;

  constructor(appName: string) {
    this.app = new PolkadotApp(appName);
  }

  connection(endpoint: string): ApiPromise {
    const provider = new WsProvider(endpoint);
    const api: ApiPromise = new ApiPromise(options({provider}));

    return api;
  }

  subscribe(callback: BalanceCallback): void {
    this.observers.push(callback);
  }

  async createSignature(nonce: number, address: string): Promise<string> {
    return this.app.createSignature(address, nonce);
  }

  async estimateFee(currency: Currency, from: string, to: string): Promise<BN> {
    const api = this.connection(currency.network.rpcURL);

    const amount = random(1000, 10);

    const {partialFee: fee} = currency.native
      ? await api.tx.balances.transfer(to, amount).paymentInfo(from)
      : await api.tx.currencies.transfer(to, {TOKEN: currency.id}, amount).paymentInfo(from);

    await api.disconnect();

    return fee;
  }

  async getBalance(currency: Currency, account: string): Promise<BN> {
    const api = this.connection(currency.network.rpcURL);

    await api.isReadyOrError;

    let free: u128 | UInt;

    if (currency.native) {
      const result = await api.query.system.account(account);

      free = result.data.free;
    } else {
      const result = await api.query.tokens.accounts<OrmlAccountData>(account, {
        TOKEN: currency.id,
      });

      free = result.free;
    }

    if (this.observers.length > 0) {
      this._subscribeBalanceChange(account, currency, free);
    }

    return free.toBn();
  }

  async sendTransaction(currency: Currency, from: string, to: string, amount: BN): Promise<void> {
    const api = this.connection(currency.network.rpcURL);
    const native = true;

    await api.isReadyOrError;

    const account = await this.app.getAccount(from);

    if (!account) throw new Error('Account not found on extension');

    const signer = await this.app.getSigner(account);

    const transferExtrinsic = native
      ? api.tx.balances.transfer(to, amount)
      : api.tx.currencies.transfer(to, {TOKEN: currency.id}, amount);

    const txInfo = await transferExtrinsic.signAsync(from, {
      signer,
      // make sure nonce does not stuck
      nonce: -1,
    });

    await new Promise((resolve, reject) => {
      txInfo.send(result => {
        if (result.status.isFinalized) {
          const hash = result.status.asFinalized.toHex();
          api.disconnect();
          resolve(hash);
        }

        if (result.isError) {
          console.log(`\tFinalized     : null`);
          api.disconnect();
          reject();
        }
      });
    });
  }

  async getTips(payload: TipsBalanceInfo): Promise<TipResult | null> {
    const {serverId, referenceType, referenceId, ftIdentifier} = payload;

    const api = this.connection('');

    const result = await api.query.tipping.tipsBalanceByReference(
      serverId,
      referenceType,
      referenceId,
      ftIdentifier,
    );

    const info = result.toJSON() as any as TipResult | null;

    await api.disconnect();

    return info;
  }

  async claimTip(payload: TipsBalanceInfo): Promise<void> {
    const {wallet, ...restPayload} = payload;

    const api = this.connection('');

    const account = await this.app.getAccount(wallet);

    if (!account) throw new Error(`Account not found for ${wallet} wallet`);

    const signer = await this.app.getSigner(account);

    const extrinsic = api.tx.tipping.claimTip(restPayload);

    await extrinsic.signAndSend(wallet, {nonce: -1, signer});

    await api.disconnect();
  }

  private async _subscribeBalanceChange(
    account: string,
    currency: Currency,
    currentBalance: BN,
  ): Promise<void> {
    const api = this.connection('');

    await api.isReadyOrError;

    if (currency.native) {
      api.query.system.account(account, ({data: {free}, nonce}) => {
        // Calculate the delta
        const change = free.sub(currentBalance);

        // Only display positive value changes (Since we are pulling `previous` above already,
        // the initial balance change will also be zero)
        if (!change.isZero()) {
          console.log(`New balance change of ${change}, nonce ${nonce}`);

          this.observers.forEach(observer => observer(currency, change));
        }
      });
    } else {
      api.query.tokens.accounts(
        account,
        {
          TOKEN: currency.id,
        },
        ({free}: OrmlAccountData) => {
          // Calculate the delta
          const change = free.sub(currentBalance);

          // Only display positive value changes (Since we are pulling `previous` above already,
          // the initial balance change will also be zero)
          if (!change.isZero()) {
            console.log(`New balance change of ${change}`);

            this.observers.forEach(observer => observer(currency, change));
          }
        },
      );
    }
  }
}
