import { TApifoxDataType } from "./types";
import { Project, SourceFile, StructureKind, IndentationText } from "ts-morph";
import { getModalNameAndKey } from "../utils/utils";
import { ensureDir, existsFile } from "../utils/fs";
import { DEFAULT_MODAL_DIR } from "../constants";
import { generatePropertyFile } from "../utils/properties";

import { TypeFile } from "../modals/typeFile";

type TProperties = Record<
  string,
  {
    type: TApifoxDataType;
    properties?: IComponent;
    title?: string;
    enum?: string[];
    "x-apifox": {
      enumDescriptions: Record<string, string>;
    };
  }
>;

export interface IComponent {
  type: TApifoxDataType;
  properties?: TProperties;
  required?: string[];
  items?: IComponent;
  enum?: string[];
  "x-apifox": {
    enumDescriptions: Record<string, string>;
  };
  title: string;
  description?: string;
  $ref?: string;
  
}
type Modals = Record<string, IComponent>;

interface IModalOptions {
  modals: Modals;
  modalDir: string;
}

interface ModalFile {
  fileName: string;
}

export class Modal {
  project: Project | null = null;
  modalDir: string = "";
  modalFiles: ModalFile[] = [];
  constructor(options: IModalOptions) {
    const { modalDir, modals } = options;
    const project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
      },
    });
    this.project = project;
    this.modalDir = modalDir || DEFAULT_MODAL_DIR;
    this.generateModalFile(modals);
    this.generateExportFile();
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
      this.modalFiles.push({ fileName });
      ensureDir(modalDir);
      generatePropertyFile({
        project: this.project,
        filePath,
        modalFileName,
        component: modals[component],
      });
      const typeFile = new TypeFile(modals[component], component, {
        project: this.project,
        filePath: rootDir + "/debug/propertyModal/" + fileName,
      });
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
    if (type === "array") {
      return {};
    } else {
    }
    return Object.keys(properties).map((key) => {
      const { type, title, enum: enumList } = properties[key];
      if (enumList && enumList.length) {
        //@ts-ignore
        const { enumDescriptions = {} } = properties[key]["x-apifox"] || {};
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
        hasQuestionToken: isOptional,
      };
    });
  }

  /**
   * @description: 生成导出文件
   * @return {*}
   */
  generateExportFile() {
    if (!this.project) return;
    const rootDir = process.cwd();
    const exportFilePath = rootDir + this.modalDir + "/index.ts";
    const file = this.project.createSourceFile(exportFilePath, undefined, {
      overwrite: true,
    });
    this.modalFiles.forEach((modalFile) => {
      const modalName = modalFile.fileName.replace(".ts", "");
      file.addExportDeclaration({
        moduleSpecifier: `./${modalName}`,
        namedExports: [modalName],
        isTypeOnly: true,
      });
    });
    file.saveSync();
  }
}
