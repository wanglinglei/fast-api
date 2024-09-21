import { IComponent } from "../scripts/modal";
import { Project, SourceFile, StructureKind, IndentationText } from "ts-morph";
interface IEnumProperty {
  name: string;
  nameSpace: string;
  members: { name: string; value: string; docs: string[] }[];
}

interface IGenerateConfig {
  project: Project;
  filePath: string;
  modalFileName: string;
  component: IComponent;
}

export function generatePropertyFile(config: IGenerateConfig) {
  const { project, filePath, modalFileName, component } = config;
  const file = project.createSourceFile(filePath, undefined, {
    overwrite: true,
  });
  const { type, enumProperty, resProperties } = processProperty(
    component,
    modalFileName
  );

  // 生成类型枚举
  if (enumProperty && enumProperty.length) {
    const fileModule = file.addModule({
      // @ts-ignore
      name: modalFileName,
      isExported: true,
    });
    enumProperty.forEach((item) => {
      fileModule.addEnum({
        name: item.name,
        isExported: true,
        members: item.members,
      });
    });
  }

  if (type === "array") {
    const itemName = modalFileName + "Item";
    file.addInterface({
      name: itemName,
      isExported: true,
      //@ts-ignore
      properties: resProperties,
    });
    file.addTypeAlias({
      name: modalFileName,
      isExported: true,
      type: `${itemName}[]`,
    });
  } else if (type === "object") {
    file.addInterface({
      name: modalFileName,
      isExported: true,
      //@ts-ignore
      properties: resProperties,
    });
  } else {
    let baseType = type;
    if (enumProperty && enumProperty.length) {
      return;
    } else if (type === "integer") {
      baseType = "number";
    }
    file.addTypeAlias({
      name: modalFileName,
      isExported: true,
      type: baseType,
    });
  }
  file.saveSync();
}

/**
 * @description: 根据类型解析属性数据
 * @param {IComponent} component
 * @param {string} modalFileName
 * @return {*}
 */
export function processProperty(
  component: IComponent,
  modalFileName: string
): {
  type: string;
  enumProperty: IEnumProperty[];
  resProperties: any[];
} {
  const { type } = component;
  if (type === "array") {
    const { items } = component;
    const { enumProperty, resProperties } = processProperty(
      items as IComponent,
      modalFileName
    );
    return {
      type,
      enumProperty,
      resProperties,
    };
  } else if (type === "object") {
    return processObjectProperty(component, modalFileName);
  } else {
    return processBaseTypeProperty(component, modalFileName);
  }
}

/**
 * @description: 解析对象类型数据
 * @param {IComponent} component
 * @param {string} modalFileName
 * @return {*}
 */
function processObjectProperty(component: IComponent, modalFileName: string) {
  const { type, properties, required } = component;
  if (!properties)
    return {
      type,
      enumProperty: [],
      resProperties: [],
    };
  let enumProperty: IEnumProperty[] = [];
  const resProperties = Object.keys(properties).map((key) => {
    const { type, title, enum: enumList } = properties[key];
    if (enumList && enumList.length) {
      // 处理枚举数据
      //@ts-ignore
      const { enumDescriptions = {} } = properties[key]["x-apifox"] || {};
      const members = enumList.map((member) => {
        return {
          name: member,
          value: member,
          docs: [enumDescriptions[member]],
        };
      });
      const enumPropertyItem = processEnumProperty(
        component,
        modalFileName,
        key
      );
      if (enumPropertyItem) {
        enumProperty.push(enumPropertyItem);
      }
    }
    const isOptional = required && !required.includes(key);
    return {
      name: key,
      type: enumList ? `${modalFileName}.${key}` : type,
      docs: title ? [title] : [""],
      enum: enumList,
      description: title,
      hasQuestionToken: isOptional,
    };
  });

  return {
    type,
    enumProperty: enumProperty || null,
    resProperties,
  };
}

/**
 * @description: 解析基础类型数据
 * @param {IComponent} component
 * @param {string} modalFileName
 * @return {*}
 */
function processBaseTypeProperty(component: IComponent, modalFileName: string) {
  const { type, properties, required } = component;
  if (type === "array" || type === "object") {
    return {
      type,
      enumProperty: [],
      resProperties: [],
    };
  }
  const enumProperty = processEnumProperty(
    component,
    modalFileName,
    modalFileName
  );
  return {
    type,
    enumProperty: enumProperty ? [enumProperty] : [],
    resProperties: [],
  };
}

function processEnumProperty(
  component: IComponent,
  modalFileName: string,
  key: string
) {
  const { enum: enumList } = component;
  let enumPropertyItem: IEnumProperty | null = null;
  if (enumList && enumList.length) {
    // 处理枚举数据
    //@ts-ignore
    const { enumDescriptions = {} } = component["x-apifox"] || {};
    const members = enumList.map((member) => {
      return {
        name: member,
        value: member,
        docs: [enumDescriptions[member]],
      };
    });
    enumPropertyItem = {
      name: key,
      nameSpace: modalFileName,
      members,
    };
  }
  return enumPropertyItem;
}
