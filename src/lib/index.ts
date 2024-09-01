import { IConfig, IConfigOptions } from "./types";
import { groupFileByPath, IGroupPath } from "./process";
import fs from "fs";
export class FastApi {
  Authorization: string;
  version: string;
  configOptions: IConfigOptions;
  constructor(config: IConfig) {
    const { Authorization, version = "2024-03-28", configOptions } = config;
    if (!Authorization) {
      throw new Error("you must specify authorization");
    }
    this.Authorization = Authorization;
    this.version = version;
    this.configOptions = configOptions;
  }

  async requestApi() {
    const { Authorization, version, configOptions } = this;
    var axios = require("axios");
    var data = JSON.stringify({
      scope: {
        type: "ALL",
        excludedByTags: ["pet"],
      },
      options: {
        includeApifoxExtensionProperties: false,
        addFoldersToTags: false,
      },
      oasVersion: "3.1",
      exportFormat: "JSON",
    });

    var config = {
      method: "post",
      url: "https://api.apifox.com/v1/projects/4510606/export-openapi?locale=zh-CN",
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
        JSON.stringify(response.data.paths, null, 2)
      );
      const groupPath = groupFileByPath(response.data.paths);
      fs.writeFileSync(
        "./debug/group.json",
        JSON.stringify(groupPath, null, 2)
      );
      this.generate(groupPath);
    } catch (error) {
      console.log(error);
    }
  }

  generate(groupPath: IGroupPath) {}
}
