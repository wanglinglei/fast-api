import { TApifoxDataType } from "./types";
import { Project, SourceFile, StructureKind } from "ts-morph";
import { getModalNameAndKey } from "../utils/utils";
import { ensureDir, existsFile } from "../utils/fs";

type TProperties = Record<
  string,
  {
    type: TApifoxDataType;
    title: string;
    enum?: string[];
    "x-apifox": {
      enumDescriptions: Record<string, string>;
    };
  }
>;

interface IComponent {
  type: TApifoxDataType;
  properties: TProperties;
  required: string[];
}
type Modals = Record<string, IComponent>;

interface IModalOptions {
  modals: Modals;
  modalDir: string;
}

export class Modal {
  project: Project | null = null;
  modalDir: string = "";
  constructor(options: IModalOptions) {
    const { modalDir, modals } = options;
    const project = new Project();
    this.project = project;
    this.modalDir = modalDir || process.env.DEFAULT_MODAL_DIR || "";
    this.generateModalFile(modals);
  }

  /**
   * @description: 生成模型文件
   * @param {Modals} modals
   * @return {*}
   */
  generateModalFile(modals: Modals) {
    if (!this.project) return;
    const rootDir = process.cwd();
    for (const component in modals) {
      const keyString = "/schemas/" + component;
      const { modalFileName, modalKey } = getModalNameAndKey(keyString);
      const fileName = modalFileName + ".ts";
      const modalDir = rootDir + this.modalDir;
      const filePath = rootDir + this.modalDir + "/" + fileName;
      console.log("filePath", modalDir, filePath);
      ensureDir(modalDir);
      const file = this.project.createSourceFile(filePath, undefined, {
        overwrite: true,
      });

      // 添加命名空间

      const { type, properties, required } = modals[component];

      const resProperties = this.generateModalProperty({
        type,
        properties,
        required,
        modalFileName,
        file,
      });
      console.log("resProperties", modalKey, resProperties);
      file.addInterface({
        name: modalKey,
        isExported: true,
        properties: resProperties,
      });
      file.saveSync();
    }
  }

  /**
   * @description: 生成类型
   * @param {TProperties} properties
   * @param {SourceFile} file
   * @return {*}
   */
  generateModalProperty(config: {
    type: TApifoxDataType;
    properties: TProperties;
    required: string[];
    modalFileName: string;
    file: SourceFile;
  }) {
    const { type, properties, required, modalFileName, file } = config;
    return Object.keys(properties).map((key) => {
      const { type, title, enum: enumList } = properties[key];
      if (enumList && enumList.length) {
        //@ts-ignore
        const { enumDescriptions = {} } = properties[key]["x-apifox"] || {};
        console.log("enumDescription", properties[key], enumDescriptions);
        const members = enumList.map((member) => {
          return {
            name: member,
            value: member,
            docs: [enumDescriptions[member]],
          };
        });
        const fileModule = file.addModule({
          // @ts-ignore
          name: modalFileName,
          isExported: true,
        });
        fileModule.addEnum({
          name: key,
          isExported: true,
          members: members,
        });
      }

      const isOptional = !required.includes(key);
      return {
        name: key,
        type: enumList ? `${modalFileName}.${key}` : type,
        docs: title ? [title] : [""],
        enum: enumList,
        description: title,
        isOptional: false,
      };
    });
  }
}
