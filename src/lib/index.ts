import { IConfig, IConfigOptions } from "./types";
import fs from "fs";

import { Group } from "./scripts/group";
import { Modal } from "./scripts/modal";

export class FastApi {
  Authorization: string;
  version: string;
  configOptions: IConfigOptions;
  projectId: string;
  constructor(config: IConfig) {
    const {
      Authorization,
      version = "2024-03-28",
      configOptions,
      projectId,
    } = config;
    if (!Authorization) {
      throw new Error("you must specify authorization");
    }
    this.Authorization = Authorization;
    this.version = version;
    this.configOptions = configOptions;
    this.projectId = projectId;
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
        includeApifoxExtensionProperties: true,
        addFoldersToTags: false,
      },
      oasVersion: "3.1",
      exportFormat: "JSON",
    });

    var config = {
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
        new Modal(response.data.components.schemas);
      }
      console.log("Group---groups", group.groups);
      fs.writeFileSync(
        "./debug/group.json",
        JSON.stringify(group.groupFils, null, 2)
      );
      // group.groupByPath();
    } catch (error) {
      console.log(error);
    }
  }
}
