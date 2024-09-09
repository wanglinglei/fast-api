/*
 * @Author: wanglinglei
 * @Description:接口文件配置
 * @Date: 2024-09-07 09:08:13
 * @LastEditTime: 2024-09-09 18:47:34
 * @FilePath: /personal/fast-api/src/lib/scripts/groupFile.ts
 */

import { IGroup } from "./group";
import { API } from "./api";

export interface IDepenDencies {
  // fileName: key[]
  [key: string]: string[];
}

export class GroupFile {
  group: IGroup;
  // 依赖的数据模型
  dependencies: IDepenDencies;
  // 包含的api
  apis: API[] = [];
  // 文件名称
  groupName: string = "";

  constructor(group: IGroup) {
    this.group = group;
    this.dependencies = {};
    this.getApiConfig();
  }
  valueOf() {
    return {
      dependencies: this.dependencies,
      apis: this.apis,
      groupName: this.groupName,
    };
  }

  setGroupName(name: string) {
    this.groupName = name;
  }

  getApiConfig() {
    this.group.paths.forEach((path) => {
      const api = new API(path);
      //@ts-ignore
      this.apis.push(api.valueOf());
    });
    this.generateDependencies();
  }

  /**
   * @description: 生成依赖
   * @return {*}
   */
  generateDependencies() {
    this.apis.forEach((api) => {
      const apiDependencies = api.dependencies;
      for (const dependency in apiDependencies) {
        if (this.dependencies.hasOwnProperty(dependency)) {
          apiDependencies[dependency].forEach((dependencyKey) => {
            if (!this.dependencies[dependency].includes(dependencyKey)) {
              this.dependencies[dependency].push(dependencyKey);
            }
          });
        } else {
          // 当前不存在直接push
          this.dependencies[dependency] = [...apiDependencies[dependency]];
        }
      }
    });
  }
}
