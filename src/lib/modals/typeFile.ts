import { Property } from "./property";
import { ArrayProperty } from "./arrayProperty";
import { BaseTypeProperty } from "./baseTypeProperty";
import { ObjectProperty } from "./objectProperty";
import { IComponent } from "../scripts/modal";
import fs from "fs";
import {
  Project,
  SourceFile,
  StructureKind,
  IndentationText,
  ModuleDeclaration,
} from "ts-morph";

import { IDependency } from "./types";

interface ITypeFileConfig {
  filePath: string;
  project: Project;
}

const baseType = ["string", "integer", "boolean", "number", "null", "any"];

export class TypeFile extends Property {
  root = true; // 文件根节点标识
  config: ITypeFileConfig;
  fileProperty: any = {};
  file: SourceFile = {} as SourceFile;
  nameSpace: ModuleDeclaration = {} as ModuleDeclaration;
  dependency: IDependency[] = []; // 依赖的模型
  constructor(component: IComponent, key: string, config: ITypeFileConfig) {
    super(component, key);
    this.config = config;
    const { project, filePath } = this.config;
    this.file = project.createSourceFile(filePath, undefined, {
      overwrite: true,
    });
    this.processProperties(component);
    this.generateFileImport();
    this.generateTypeFile();
  }

  /**
   * @description: 处理节点数据
   * @param {IComponent} component
   * @return {*}
   */
  processProperties(component: IComponent) {
    let property;
    if (this.type === "object") {
      property = new ObjectProperty(component, this.key);
    } else if (this.type === "array") {
      property = new ArrayProperty(component, this.key);
    } else {
      property = new BaseTypeProperty(component, this.key);
    }
    this.dependency = property.dependency;
    this.fileProperty = property;

    // console.log("property", this.fileProperty);
    fs.writeFileSync(
      `./debug/property/${this.key}.json`,
      JSON.stringify(
        {
          property: this.fileProperty,
          dependency: this.dependency,
        },
        null,
        2
      )
    );
  }

  /**
   * @description: 生成文件import
   * @return {*}
   */
  generateFileImport() {
    if (!this.dependency.length) return;
    this.dependency.forEach((item) => {
      const { file, modalKey } = item;
      this.file.addImportDeclaration({
        moduleSpecifier: `./${file}`,
        namedImports: modalKey,
      });
    });
  }

  /**
   * @description: 生成类型文件
   * @return {*}
   */
  generateTypeFile() {
    if (this.key === "userDetailInfo") {
      console.log("this.fileProperty", this.checkIsNeedNamespace());
    }
    if (this.checkIsNeedNamespace()) {
      this.nameSpace = this.file.addModule({
        name: this.key,
        isExported: true,
      });
    }
    this.generateType(this.fileProperty, this.key, true);
    this.file.saveSync();
  }

  /**
   * @description: 生成类型参数
   * @param {any} property
   * @param {string} key
   * @param {Boolean} isRoot
   * @return {*}
   */
  generateType(property: any, key: string, isRoot: Boolean) {
    if (!property) return;
    if (property && property.members && property.members.length) {
      this.nameSpace.addEnum({
        name: property.key,
        isExported: true,
        members: property.members,
      });
    }
    try {
      if (property.type === "object") {
        const properties = property.properties.map((item: any) => {
          if (item.type === "object") {
            this.generateType(item, item.key, false);
            return {
              name: item.key,
              type: `${this.key}.${item.key}`,
              docs: item.desc ? [item.desc] : [],
            };
          } else if (item.type === "array") {
            this.generateType(item, item.key, false);
            return {
              name: item.key,
              type: `${this.key}.${item.key}Item[]`,
              docs: item.desc ? [item.desc] : [],
            };
          } else {
            let enumKey = "";
            if (item.members && item.members.length) {
              if (!this.nameSpace) {
                this.nameSpace = this.file.addModule({
                  name: this.key,
                  isExported: true,
                });
              }
              enumKey = this.key + "." + item.key;
              this.nameSpace.addEnum({
                name: item.key,
                isExported: true,
                members: item.members,
              });
            }
            return {
              name: item.key,
              type: enumKey ? enumKey : item.property.type,
              docs: item.property.desc ? [item.property.desc] : [],
            };
          }
        });
        if (isRoot) {
          this.file.addInterface({
            name: property.key,
            isExported: true,
            properties: properties,
          });
        } else {
          this.nameSpace.addInterface({
            name: property.key,
            isExported: true,
            properties: properties,
          });
        }
      } else if (property.type === "array") {
        // 判断子元素是否是基础类型
        let arrayItemType = "any";

        if (
          property.properties[0].type === "object" ||
          property.properties[0].type === "array"
        ) {
          this.generateType(property.properties[0], property.key, false);
          const arrayItemKey = property.properties[0].key;
          arrayItemType = `${this.key}.${arrayItemKey}[]`;
        } else {
          arrayItemType = property.properties[0].type;
        }
        if (isRoot) {
          this.file.addTypeAlias({
            name: property.key,
            type: `${arrayItemType}`,
            docs: property.desc ? [property.desc] : [],
          });
        }
      }
    } catch (error) {
      console.log(property, key, error);
    }
  }

  /**
   * @description: 判断是否需要命名空间
   * @description: 存在非基础类型 或者存在枚举
   * @return {*}
   */
  checkIsNeedNamespace() {
    if (this.fileProperty.members && this.fileProperty.members.length) {
      return true;
    }
    if (this.fileProperty.type === "object") {
      return true;
    } else if (this.fileProperty.type === "array") {
      if (baseType.includes(this.fileProperty.properties[0].type)) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }
}
