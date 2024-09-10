export interface ICommonResponse<T> {
  code: string;
  msg: string;
  data: T;
  subCode: string;
  subMsg: string;
}

export interface IErrorMessage {
  code: string;
  message: string;
  subCode?: string;
  subMessage?: string;
}
