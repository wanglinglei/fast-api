/*
 * @Author: wanglinglei
 * @Description: 配置项类型定义
 * @see: https://apifox-openapi.apifox.cn/api-173411997
 * @Date: 2024-08-31 18:54:51
 * @LastEditTime: 2024-08-31 19:27:44
 * @FilePath: /fast-api/src/lib/types.ts
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

export interface IConfig {
  version?: string; //default 2024-03-28
  Authorization: string;
  configOptions: IConfigOptions;
}
