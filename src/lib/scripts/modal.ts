import { TApifoxDataType } from "./types";
import { Project } from "ts-morph";
import { getModalNameAndKey } from "./utils";
interface IComponent {
  type: TApifoxDataType;
  properties: Record<
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
  required: string[];
}
type Modals = Record<string, IComponent>;

export class Modal {
  project: Project | null = null;
  constructor(modals: Modals) {
    const project = new Project();
    this.project = project;
    this.generateModalFile(modals);
    // 添加一个新文件到项目中
    const file = project.createSourceFile("./example.d.ts", undefined, {
      overwrite: true, // 如果文件已存在，覆盖它
    });

    // 添加一个接口
    file.addInterface({
      name: "User",
      isExported: true,
      properties: [
        {
          name: "id",
          type: "number",
          docs: ["用户id"],
        },
        {
          name: "name",
          type: "string",
        },
        {
          name: "email",
          type: "string",
        },
      ],
    });
    console.log(file);
    // 保存文件到磁盘
    file.saveSync();

    // 你也可以直接保存整个项目
    project.saveSync();
  }
  generateModalFile(modals: Modals) {
    if (!this.project) return;
    for (const component in modals) {
      const keyString = "/schemas/" + component;
      console.log("component", keyString);
      const { modalFileName, modalKey } = getModalNameAndKey(keyString);
      const fileName = modalFileName + ".ts";
      const filePath = "./debug/modals/" + fileName;
      const file = this.project.createSourceFile(filePath, undefined, {
        overwrite: true,
      });

      const { type, properties, required } = modals[component];

      const resProperties = Object.keys(properties).map((key) => {
        const {
          type,
          title,
          // enum: enumList,
          // "x-apifox": { enumDescriptions },
        } = properties[key];
        // const enumDescription = enumDescriptions?[enumList[0]];
        return {
          name: key,
          type: type,
          docs: title ? [title] : [],
        };
      });
      console.log("resProperties", resProperties);
      console.log("modalkey", modalKey);
      file.addInterface({
        name: modalKey,
        isExported: true,
        properties: resProperties,
      });
      file.saveSync();
    }
  }
}
