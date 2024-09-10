/*
 * @Author: wanglinglei
 * @Description: 配置项类型定义
 * @see: https://apifox-openapi.apifox.cn/api-173411997
 * @Date: 2024-08-31 18:54:51
 * @LastEditTime: 2024-09-10 17:39:28
 * @FilePath: /personal/fast-api/src/lib/types.ts
 */

// 到处全部接口
export interface ExportAllScope {
  type: "ALL";
  excludedByTags?: string[]; // 排除制定标签
}
// 导出指定接口
export interface ExportSelectScope {
  type: "SELECTED_ENDPOINTS";
  selectedEndpointIds?: number[];
  excludedByTags?: string[];
}

// 导出指定标签的接口
export interface ExportTagScope {
  type: "SELECTED_TAGS";
  selectedTags?: string[]; // 指定标签
  excludedByTags?: string[];
}

// 导出指定目录
export interface ExportFolderScope {
  type: "SELECTED_FOLDERS";
  selectedTags?: number[]; // 指定文件夹id
  excludedByTags?: string[];
}

export interface options {
  includeApifoxExtensionProperties: boolean; //default false 指定是否包含 Apifox 的 OpenAPI 规范扩展字段x-apifox。
  addFoldersToTags: boolean; //default false
}

export interface IConfigOptions {
  scope:
    | ExportAllScope
    | ExportSelectScope
    | ExportTagScope
    | ExportFolderScope;
  options?: options;
  oasVersion?: "3.0" | "3.1" | "2.0";
  exportFormat?: "JSON" | "YAML";
  environmentIds?: number[];
}

export interface IInputConfig {
  // http 入口文件 需对外暴露get post 不传则去模版生成
  httpFilePath?: string;
}

export interface IOutputConfig {
  // 模型文件目录 default  /src/services/modal
  modalDir?: string;
  // 接口文件目录 default /src/services/apis
  apiDir?: string;
  // http 基础请求文件目录 default /src/services/
  httpDir?: string;
  // 基础请求文件目录 default false
  // 为避免在基础请求生成后自定义修改被覆盖 不建议配置
  coverHttpFile?: boolean;
}

export interface IConfig {
  version?: string; //default 2024-03-28
  Authorization: string; // apifox authorization
  projectId: string; // 需要生成的项目id
  configOptions: IConfigOptions;
  input?: IInputConfig;
  output?: IOutputConfig;
}
