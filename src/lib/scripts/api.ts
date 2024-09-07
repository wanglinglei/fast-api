/*
 * @Author: wanglinglei
 * @Description: 获取接口配置
 * @Date: 2024-09-07 09:53:04
 * @LastEditTime: 2024-09-07 17:30:02
 * @FilePath: /fast-api/src/lib/scripts/api.ts
 */

import { getModalNameAndKey } from "./utils";
import { IDepenDencies } from "./groupFile";

import { IApiOption, IPath, TApifoxDataType } from "./types";
export interface IParamKey {
  key: string;
  description: string;
  type: string;
  required: boolean;
  enumKey?: string[];
  enumDesc?: Record<string, string>;
  modalFileName?: string;
}

export interface IResponseDataItem {
  key: string;
  description: string;
  type?: TApifoxDataType;
  required: boolean;
  enumKey?: string[];
  isModal?: boolean; // 是否是模型数据
}

export interface IResponseData {
  type: TApifoxDataType;
  dataKeys: IResponseDataItem[];
  isModal: boolean;
}

export class API {
  private path: IPath;
  private apiOption: IApiOption;
  api: string = ""; //请求地址
  method: string | null = null; // 请求方式
  params: IParamKey[] = []; // 请求参数
  responseData: IResponseData | null = null; // 响应参数
  dependencies: IDepenDencies = {}; // 依赖模型
  apiName: string = ""; //请求名称

  constructor(path: IPath) {
    this.path = path;
    let apiOption;
    for (let key in path) {
      apiOption = path[key];
      this.method = key;
      this.api = apiOption.api;
      this.apiName = apiOption.summary;
    }
    this.apiOption = apiOption as IApiOption;
    this.getParams();
    this.getResponseData();
  }

  valueOf() {
    return {
      api: this.api,
      method: this.method,
      params: this.params,
      responseData: this.responseData,
      dependencies: this.dependencies,
      apiName: this.apiName,
    };
  }

  addDependency(modalFileName: string, key: string) {
    if (this.dependencies.hasOwnProperty(modalFileName)) {
      this.dependencies[modalFileName].push(key);
    } else {
      this.dependencies[modalFileName] = [key];
    }
  }

  getResponseData() {
    if (
      this.apiOption.responses["200"].content["application/json"].schema
        .properties.data
    ) {
      const resData =
        this.apiOption.responses["200"].content["application/json"].schema
          .properties.data;
      const { type, items } = resData;
      const resDataKeys = [];

      if (items) {
        if (items["$ref"]) {
          const { modalFileName, modalKey } = getModalNameAndKey(items["$ref"]);

          // 插入依赖
          this.addDependency(modalFileName, modalKey);
          resDataKeys.push({
            key: modalKey,
            modalFileName,
            description: "",
            required: true,
            isModal: true,
          });
        } else if (items.properties) {
          const { required = [], properties } = items;
          for (const key in properties) {
            const keyItem = properties[key];
            const { enum: enumKey = [], type, title, description } = keyItem;
            const isRequired = required.includes(key);
            const dataKeyItem: IResponseDataItem = {
              key,
              description,
              type,
              required: isRequired,
            };
            if (enumKey) {
              dataKeyItem.enumKey = enumKey;
            }
            resDataKeys.push(dataKeyItem);
          }
        }
      }
      if (resData["$ref"]) {
        const { modalFileName, modalKey } = getModalNameAndKey(resData["$ref"]);

        // 插入依赖
        this.addDependency(modalFileName, modalKey);
        resDataKeys.push({
          key: modalKey,
          modalFileName,
          description: "",
          required: true,
          isModal: true,
        });
      }
      this.responseData = {
        type,
        dataKeys: resDataKeys,
        isModal: !!resData["$ref"],
      };
    }
  }

  /**
   * @description: 获取请求参数
   * @return {*}
   */
  getParams() {
    if (this.method === "get") {
      this.getRequestParams();
    } else if (this.method === "post") {
      this.getRequestBody();
    }
  }
  /**
   * @description: 获取get请求的参数
   * @return {*}
   */
  getRequestParams() {
    if (this.apiOption.parameters && this.apiOption.parameters.length) {
      // 处理get请求参数
      const parameters = this.apiOption.parameters.filter(
        (item: any) => item.in === "query"
      );
      const params = parameters.map((item: any) => {
        const { description, schema, name, required } = item;
        const { type } = schema;
        let paramsKeyItem: IParamKey = {
          description,
          key: name,
          required,
          type,
        };
        if (schema.enum && schema.enum.length) {
          const enumKey = schema.enum;
          const enumDesc = schema["x-apifox"]?.enumDescriptions;
          paramsKeyItem.enumKey = enumKey;
          paramsKeyItem.enumDesc = enumDesc;
        }
        return paramsKeyItem;
      });
      this.params = params;
    }
  }

  /**
   * @description: 获取post 请求参数
   * @return {*}
   */
  getRequestBody() {
    if (this.apiOption.requestBody && this.apiOption.requestBody.content) {
      if (this.apiOption.requestBody.content["application/json"]) {
        const schema =
          this.apiOption.requestBody.content["application/json"].schema;
        const { type, properties, required } = schema;
        let paramsKeys = [];
        if (schema["x-apifox-refs"]) {
          // 如果采用的是数据模型
          const refs = schema["x-apifox-refs"];
          for (const key in refs) {
            const keyPaths = refs[key]["$ref"].split("/");
            const ref = refs[key]["$ref"];
            const { modalFileName, modalKey } = getModalNameAndKey(ref);

            // 插入依赖
            this.addDependency(modalFileName, modalKey);
            paramsKeys.push({
              key: modalKey,
              modalFileName,
              description: "",
              required: true,
              isModal: true,
              type: "",
            });
          }
        } else {
          for (const key in properties) {
            const keyItem = properties[key];
            //@ts-ignore
            const { enum: enumKey, type, title, description } = keyItem;
            const isRequired = required.includes(key);
            const paramsKeyItem: IParamKey = {
              description,
              key,
              required: isRequired,
              type,
            };
            if (enumKey) {
              paramsKeyItem.enumKey = enumKey;
            }
            paramsKeys.push(paramsKeyItem);
          }
        }

        this.params = paramsKeys;
      }
    }
  }
}
