import { IConfig, IConfigOptions, IInputConfig, IOutputConfig } from "./types";
import axios from "axios";
import fs from "fs-extra";
import path from "path";

import { Group } from "./scripts/group";
import { Modal } from "./scripts/modal";
import { ensureDir, isExistsDir } from "./utils/fs";
import { DEFAULT_HTTP_DIR, DEFAULT_MODAL_DIR } from "./constants";

export class FastApi {
  Authorization: string;
  version: string;
  configOptions: IConfigOptions;
  projectId: string;
  input: IInputConfig = {};
  output: IOutputConfig = {};
  constructor(config: IConfig) {
    const {
      Authorization,
      version = "2024-03-28",
      configOptions,
      projectId,
      input = {},
      output = {},
    } = config;
    if (!Authorization) {
      throw new Error("you must specify authorization");
    }
    this.Authorization = Authorization;
    this.version = version;
    this.configOptions = configOptions;
    this.projectId = projectId;
    this.input = input;
    this.output = output;
    this.generateHttpFile();
  }

  async requestApi() {
    const { Authorization, version, configOptions } = this;
    const data = JSON.stringify({
      scope: {
        type: "ALL",
        excludedByTags: ["pet"],
      },
      options: {
        includeApifoxExtensionProperties: true,
        addFoldersToTags: false,
      },
      oasVersion: "3.1",
      exportFormat: "JSON",
    });

    const config = {
      method: "post",
      url: `https://api.apifox.com/v1/projects/${this.projectId}/export-openapi?locale=zh-CN`,
      headers: {
        "X-Apifox-Api-Version": version,
        Authorization: `Bearer ${Authorization}`,
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios(config);
      fs.writeFileSync(
        "./debug/response.json",
        JSON.stringify(response.data, null, 2)
      );
      const group = new Group(response.data.paths);
      if (response.data.components) {
        new Modal({
          modals: response.data.components.schemas,
          modalDir: this.output.modalDir || DEFAULT_MODAL_DIR,
        });
      }
      console.log("Group---groups", group.groups);
      fs.writeFileSync(
        "./debug/groupFils.json",
        JSON.stringify(group.groupFils[0], null, 2)
      );

      fs.writeFileSync(
        "./debug/group.json",
        JSON.stringify(group.groups, null, 2)
      );
      group.generateApiTemAndDefineTs(group.groupFils);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @description: 生成默认请求文件
   * @return {*}
   */
  generateHttpFile() {
    const { input, output } = this;
    if (input?.httpFilePath) {
      // 如果配置了自定义请求文件 不生成
      return;
    }
    console.log("__dirname", __dirname);
    const tempDir = path.join(__dirname, "../http");
    const httpDir = output.httpDir || DEFAULT_HTTP_DIR;
    const cwd = process.cwd();
    const outputHttpDir = cwd + "/" + httpDir;
    if (isExistsDir(outputHttpDir) && !output.coverHttpFile) {
      // 如果产物目录已经存在并且不允许覆写
      return;
    }
    ensureDir(outputHttpDir);
    fs.copy(tempDir, outputHttpDir);
  }
}
