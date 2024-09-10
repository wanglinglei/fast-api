import axios from "axios";
import { ICommonResponse, IErrorMessage } from "./types";
import { config } from "process";

const baseURL = "";
const timeout = 3000;

// 创建axios 请求实例
export const instance = axios.create({
  baseURL,
  timeout,
});

// axios 请求拦截器
instance.interceptors.request.use((config) => {
  return config;
});

// axios 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    return Promise.reject(error);
  }
);
