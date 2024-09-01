export interface IApiOption {
  summary: string;
  deprecated: boolean;
  description: string;
  tags: [];
  method?: string;
  parameters: [
    {
      name: string;
      in: "query" | "header";
      description: string; // 描述信息
      required: boolean; //是否必须
      example: any; // 示例;
      schema: {
        type: any; //类型
      };
    }
  ];
  responses: {
    "200": {
      content: {
        "application/json": {
          schema: {
            type: "object";
            properties: {};
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
  [key: string]: IApiOption;
}

export type IGroupPath = Record<string, IApiOption[]>;
export function groupFileByPath(paths: IPaths): IGroupPath {
  const result: { [key: string]: IApiOption[] } = {};
  for (const path in paths) {
    const pathParts = path.split("/");
    const method = pathParts[pathParts.length - 1];
    const pathKey = pathParts.slice(0, pathParts.length - 1).join("/");
    if (!result[pathKey]) {
      result[pathKey] = [];
    }
    result[pathKey].push({
      ...paths[path],
      method,
    });
  }
  console.log(result);

  return result;
}
