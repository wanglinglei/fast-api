import { IComponent } from "../scripts/modal";
import { TApifoxDataType } from "../scripts/types";
import { IDependency } from "./types";

export class Property {
  type: TApifoxDataType | string; // 属性类型
  desc: string = ""; // 属性描述
  key: string; // 属性健名
  isModal = false; // 是否是模型
  dependency: IDependency[] = []; // 依赖的模型

  constructor(component: IComponent, key: string) {
    this.key = key;
    if (this.key === "groups") {
      console.log("Group", component);
    }
    const { type, title, description } = component;
    this.type = type;

    if (title || description) {
      this.desc = title || description || "";
    }
  }

  /**
   * @description: 处理依赖的模型数据
   * @param {IDependency} dependency
   * @return {*}
   */  
  processDependency(dependency: IDependency[]) {
    dependency.forEach((item) => {
      const { file, modalKey } = item;
      const index = this.dependency.findIndex((d) => d.file === file);
      if (index > -1) {
        // 合并去重
        const dependencyItem = this.dependency[index];
        const list = dependencyItem.modalKey.concat(modalKey);
        const uniqueArray = [...new Set(list)];
        this.dependency[index].modalKey = uniqueArray;
      } else {
        this.dependency.push(item);
      }
    });
  }
}
