import { instance } from "./axios";
import { ICommonResponse, IErrorMessage } from "./types";

/**
 * @description: get 请求
 * @param {string} url
 * @param {Record} params
 * @param {*} any
 * @return {*}
 */
export function get<T>(
  url: string,
  params: Record<string, any>
): Promise<[undefined | IErrorMessage, ICommonResponse<T> | undefined]> {
  return new Promise((resolve, reject) => {
    instance
      .get(url, { params })
      .then((res: any) => {
        const response = res as unknown as ICommonResponse<T>;
        resolve([undefined, response]);
      })
      .catch((err: IErrorMessage) => {
        resolve([err, undefined]);
      });
  });
}

/**
 * @description: post 请求
 * @param {string} url
 * @param {Record} data
 * @param {*} any
 * @return {*}
 */
export function post<T>(
  url: string,
  data: Record<string, any>
): Promise<[undefined | IErrorMessage, ICommonResponse<T> | undefined]> {
  return new Promise((resolve, reject) => {
    instance
      .post(url, data)
      .then((res: any) => {
        const response = res as unknown as ICommonResponse<T>;
        resolve([undefined, response]);
      })
      .catch((err: IErrorMessage) => {
        resolve([err, undefined]);
      });
  });
}
