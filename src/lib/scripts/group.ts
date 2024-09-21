import { IPaths, IApiOption, IPath } from "./types";
import { GroupFile } from "./groupFile";
import {
  Project,
  SyntaxKind,
  InterfaceDeclarationStructure,
  OptionalKind,
  EnumDeclarationStructure,
} from "ts-morph";
import * as fs from "fs";
import * as path from "path";

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
      groupFile.setGroupName(group);
      //@ts-ignore
      this.groupFils.push(groupFile.valueOf());
    }
  }

  // 字符串首字母转大写
  capitalizeFirstLetterWithRegex(str: string) {
    return str.replace(/^./, (match) => match.toUpperCase());
  }

  //ts写入默认导入语句
  writeDefaultImport({
    defaultImportName, //默认导入的模块名称
    moduleSpecifier, //模块路径
    newApiFile, //文件源
  }: any) {
    // 检查是否已经有该默认导入
    const existingImport = newApiFile.getImportDeclaration(
      (importDeclaration: any) =>
        importDeclaration.getDefaultImport()?.getText() === defaultImportName
    );

    // 如果不存在默认导入，则添加
    if (!existingImport) {
      newApiFile.addImportDeclaration({
        defaultImport: defaultImportName,
        moduleSpecifier: moduleSpecifier,
      });
    }
  }

  generateApiTemAndDefineTs(groupData: any[]) {
    // 1. 初始化项目并加载文件
    const project = new Project();

    groupData.map((element: GroupFile) => {
      const itemApis = element.apis;
      const itemDependencies = element.dependencies;

      //接口分组文件名
      const fileName = itemApis[0].api.split("/")[1];

      const targetFilePath = `./src/api/${fileName}.ts`;

      //创建空模版文件
      const newApiFile = project.createSourceFile(
        targetFilePath,
        {},
        { overwrite: true }
      );

      //导入合集
      let importInterfaceName: string[] = [];

      //模版文件内容增加空对象
      newApiFile.addStatements(`const config = {};`);

      //读取新文件变量config
      const variableDeclaration = newApiFile.getVariableDeclaration("config");

      if (variableDeclaration) {
        //获取字面量对象
        const initializer = variableDeclaration.getInitializerIfKindOrThrow(
          SyntaxKind.ObjectLiteralExpression
        );

        const outputDir = path.resolve(__dirname, "../../api");
        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }

        const outputPath = `./src/api/${fileName + "Type"}.ts`;
        const tsTypeFile = project.createSourceFile(
          outputPath,
          {},
          { overwrite: true }
        );

        //空对象添加接口 .ts类型定义增加interface接口定义
        itemApis.map((apiPath) => {
          const apiAllStr = apiPath.api.split("/");
          const interfaceName = apiAllStr[apiAllStr.length - 1] + "Type";
          const apiName =
            apiPath.method +
            this.capitalizeFirstLetterWithRegex(
              apiAllStr[apiAllStr.length - 1]
            );

          //5.批量新增新文件中config对象接口
          const apiEndpointProperty = initializer.getProperty(apiName);

          if (apiEndpointProperty) return;

          // 在源文件中添加接口
          const interfaceDeclaration: OptionalKind<InterfaceDeclarationStructure> =
            {
              name: interfaceName,
              isExported: true,
              properties: apiPath.params
                ?.filter((f: any) => !f.isModal)
                .map((prop: any) => ({
                  name: prop.key,
                  type: prop.type,
                  hasQuestionToken: prop.required || false, // 如果是可选属性则添加 ?
                })),
            };

          tsTypeFile.addInterface(interfaceDeclaration);
          importInterfaceName.push(interfaceName);

          //枚举定义
          const enumDataList = apiPath.params?.filter(
            (l: any) => l.key == "enumType"
          );
          if (enumDataList && enumDataList.length) {
            enumDataList.forEach((enumData: any) => {
              const enumDeclaration: OptionalKind<EnumDeclarationStructure> = {
                name: enumData.key,
                isExported: true,
                members: enumData.enumKey.map((member: any) => ({
                  name: member,
                  value: member,
                  docs: [`${enumData?.enumDesc[member]}`],
                })),
              };
              tsTypeFile.addEnum(enumDeclaration);
              importInterfaceName.push(enumData.key);
            });
          }

          const modalAll = apiPath.params
            .filter((f: any) => f.isModal)
            .map((m) => m.key);
          const modalType = modalAll.join("|");
          const uniteType = modalType.length
            ? modalType + `|${interfaceName}`
            : interfaceName;

          initializer.addPropertyAssignment({
            name: apiName,
            initializer: `function (data:${uniteType}){
                                  return axios({
                                  method:'${apiPath.method}',
                                  url:'${apiPath.api}',
                                  ${
                                    apiPath.method == "get"
                                      ? "params:data"
                                      : "data:data"
                                  }
                               })
                           },`,
          });
        });

        tsTypeFile.saveSync();

        //格式化接口文件
        newApiFile.formatText();

        //增加默认导入宝包
        this.writeDefaultImport({
          defaultImportName: "axios", //默认导入的模块名称
          moduleSpecifier: "axios", //模块路径
          newApiFile, //文件源
        });

        //新文件加入导入  接口定义 语句
        newApiFile.addImportDeclaration({
          namedImports: importInterfaceName, // 导入的具名成员
          moduleSpecifier: `./${fileName + "Type"}.ts`, // 导入的模块路径
        });

        Object.keys(itemDependencies).forEach((dep: any) => {
          newApiFile.addImportDeclaration({
            namedImports: itemDependencies[dep], // 导入的具名成员
            moduleSpecifier: `@/src/services/${dep}`, // 导入的模块路径
          });
        });

        importInterfaceName = [];
        //生成并写入接口定义文件
        fs.writeFileSync(targetFilePath, newApiFile.getText());
      }
    });
  }
}
