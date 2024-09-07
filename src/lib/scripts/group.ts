import { IPaths, IApiOption, IPath } from "./types";
import { GroupFile } from "./groupFile";
export interface IGroup {
  paths: IPath[];
}

export class Group {
  paths: IPaths;
  groups: {
    [key: string]: IGroup;
  };
  groupFils: GroupFile[] = [];
  constructor(paths: IPaths) {
    this.paths = paths || {};
    this.groups = {};
    this.groupByPath();
    this.generateGroupFiles();
  }
  groupByPath() {
    for (let path in this.paths) {
      const pathParts = path.split("/");
      const apiGroupPath = pathParts[1];
      const pathItem = this.paths[path];
      if (!this.groups[apiGroupPath]) {
        this.groups[apiGroupPath] = {
          paths: [],
        };
      }
      for (let pathItemKey in pathItem) {
        pathItem[pathItemKey] = {
          ...pathItem[pathItemKey],
          api: path,
        };
      }
      this.groups[apiGroupPath].paths.push(pathItem);
    }
  }

  generateGroupFiles() {
    for (let group in this.groups) {
      const groupFile = new GroupFile(this.groups[group]);
      console.log("Generating group file", groupFile.valueOf());
      //@ts-ignore
      this.groupFils.push(groupFile.valueOf());
    }
  }
}
