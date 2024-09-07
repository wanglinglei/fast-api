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
  $ref?: string;
  items: {
    $ref?: string;
    type?: TApifoxDataType;
    properties?: TApifoxResponseDataKey;
    required?: string[];
  };
}

export type TApifoxResponseDataKey = Record<string, IApiResponseKey>;
export interface TApifoxResponseData {
  type: TApifoxDataType;
  items: {
    type: TApifoxDataType;
    properties: TApifoxResponseDataKey;
    required: string[];
  };
}

export interface IApiOption {
  api: string;
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
          "x-apifox-refs"?: {
            [key: string]: {
              $ref: string;
            };
          };
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
              data: TApifoxResponseData;
            };
          };
        };
      };
      headers: {};
      "x-apifox-name": "成功";
    };
  };
  security: [];
}

export interface IPath {
  [key: string]: IApiOption;
}
export interface IPaths {
  [key: string]: IPath;
}
