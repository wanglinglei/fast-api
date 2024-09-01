export type TApifoxDataType =
  | "string"
  | "integer"
  | "boolean"
  | "array"
  | "object"
  | "number"
  | "null"
  | "any";

// 响应key 数据结构
export interface IApiResponseKey {
  type: TApifoxDataType;
  enum: string[];
  title: string;
  description: string;
}

export interface TApifoxResponseData {
  type: TApifoxDataType;
  items: {
    type: TApifoxDataType;
    properties: TApifoxResponseDataKey;
    required: string[];
  };
}

export type TApifoxResponseDataKey = Record<string, IApiResponseKey>;

export interface IApiOption {
  summary: string;
  deprecated: boolean;
  description: string;
  tags: [];
  method: string;
  parameters?: [
    {
      name: string;
      in: "query" | "header";
      description: string; // 描述信息
      required: boolean; //是否必须
      example: any; // 示例;
      schema: {
        type: any; //类型
        enum?: string[]; // 枚举值类型
        "x-apifox"?: {
          //枚举值描述
          enumDescriptions: Record<string, string>;
        };
      };
    }
  ];
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: TApifoxDataType;
          properties: Record<string, string>;
          required: string[];
        };
        example: {
          username: "test4";
          password: "test7";
          code: "test";
        };
      };
    };
  };

  responses: {
    "200": {
      description: "";
      content: {
        "application/json": {
          schema: {
            type: "object";
            properties: {
              status: {
                type: "string";
                title: "请求状态 200 成功，其它失败";
                description: "请求状态 200 成功，其它失败";
              };
              message: {
                type: "string";
                title: "请求消息描述";
                description: "请求消息描述";
              };
              data: TApifoxResponseData;
              success: {
                type: "boolean";
                title: "请求成功true,请求失败false";
                description: "请求成功true,请求失败false";
              };
            };
            required: [
              "status",
              "message",
              "data",
              "01J6NSTEYK85B59K3G5CHA3KC4",
              "01J6NSTF3X9C4VAT7B2MX58VC7",
              "01J6NSTF8GNZV1BJSGKGKR6WGP",
              "success"
            ];
          };
        };
      };
      headers: {};
      "x-apifox-name": "成功";
    };
  };
  security: [];
}

interface IPaths {
  [key: string]: Record<string, IApiOption>;
}

export type IGroupPath = Record<string, IApiOption[]>;

export interface IParamKey {
  key: string;
  description: string;
  type: string;
  required: boolean;
  enumKey?: string[];
  enumDesc?: Record<string, string>;
}
export interface IApiConfig {
  api: string;
  method?: string;
  apiName?: string;
  params?: IParamKey[];
  resData?: any;
}

export interface IResponseDataItem {
  key: string;
  description: string;
  type: TApifoxDataType;
  required: boolean;
  enumKey?: string[];
}

export function groupFileByPath(paths: IPaths): any {
  console.log("groupFileByPath ", paths);
  const result: { [key: string]: IApiConfig[] } = {};
  for (const path in paths) {
    const pathParts = path.split("/");
    console.log("pathParts", pathParts, path);

    const pathKey = pathParts[1];
    const pathItem = paths[path];
    if (!result[pathKey]) {
      result[pathKey] = [];
    }
    for (const method in pathItem) {
      let apiConfig: IApiConfig = {
        api: path,
        method,
      };
      const apiItem = pathItem[method];
      // 处理请求参数
      if (apiItem.parameters && apiItem.parameters.length) {
        // 处理get请求参数
        const parameters = apiItem.parameters.filter(
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
        apiConfig.params = params;
      }
      if (apiItem.requestBody && apiItem.requestBody.content) {
        if (apiItem.requestBody.content["application/json"]) {
          const schema = apiItem.requestBody.content["application/json"].schema;
          const { type, properties, required } = schema;
          let paramsKeys = [];
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
          apiConfig.params = paramsKeys;
        }
      }

      //处理响应结果
      if (
        apiItem.responses["200"].content["application/json"].schema.properties
          .data
      ) {
        const resData =
          apiItem.responses["200"].content["application/json"].schema.properties
            .data;
        console.log(
          "Response",
          apiItem.responses["200"].content["application/json"].schema
        );
        const { type, items } = resData;
        const { required, properties, type: itemsType } = items;
        const resDataKeys = [];
        for (const key in properties) {
          console.log("key", key, properties[key]);
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
        apiConfig.resData = {
          type,
          resDataKeys,
        };
      }
      result[pathKey].push(apiConfig);
    }
  }

  return result;
}
