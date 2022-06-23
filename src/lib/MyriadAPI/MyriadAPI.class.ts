import {UserAPI} from './resources/UserAPI.class';

import axios, {AxiosRequestConfig, AxiosInstance, CancelTokenSource} from 'axios';

export class MyriadAPI {
  private static _instance: MyriadAPI;

  private api: AxiosInstance;

  private cancelToken: CancelTokenSource | null = null;

  readonly users: UserAPI;

  constructor(params?: any) {
    const api = axios.create({
      baseURL: '',
    });
    this.api = api;

    this.users = new UserAPI(this);
  }

  public static initialize(): void {
    MyriadAPI._instance = new MyriadAPI();
  }

  public static get instance(): MyriadAPI {
    if (!MyriadAPI._instance) {
      throw new Error('call initialize first');
    }

    return MyriadAPI._instance;
  }

  public cancelRequest(): void {
    if (this.cancelToken) {
      this.cancelToken.cancel();
    }
  }

  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    this.cancelToken = axios.CancelToken.source();

    const {data} = await this.api.request<T>(config);

    return data;
  }
}
