/*
 * @Author: wanglinglei
 * @Description:基础类型属性
 * @Date: 2024-09-12 11:30:28
 * @LastEditTime: 2024-09-21 10:58:42
 * @FilePath: /personal/fast-api/src/lib/modals/baseTypeProperty.ts
 */

import { IComponent } from "../scripts/modal";
import { Property } from "./property";
import { getModalNameAndKey } from "../utils/utils";

interface IEnumMember {
  name: string;
  value: string;
  docs: string[];
}
export class BaseTypeProperty extends Property {
  members?: IEnumMember[]; // 如果是枚举会有此属性

  constructor(component: IComponent, key: string) {
    super(component, key);
    const { enum: enumList, $ref: modalPath } = component;
    this.processType(component);
    if (enumList?.length) {
      this.processEnum(component);
    }
    if (modalPath) {
      this.isModal = true;
      const { modalFileName, modalKey } = getModalNameAndKey(modalPath);
      this.type = modalKey;
      this.dependency = [
        {
          file: modalFileName,
          modalKey: [modalKey],
        },
      ];
    }
  }

  valueOf() {
    return {
      key: this.key,
      type: this.type,
      members: this.members,
      desc: this.desc,
    };
  }

  processType(component: IComponent) {
    const { type } = component;
    if (type === "integer") {
      this.type = "number";
    }
  }
  processEnum(component: IComponent) {
    const { enum: enumList } = component;
    if (enumList?.length) {
      const { enumDescriptions } = component["x-apifox"];
      if (enumDescriptions) {
        const members = enumList.map((member) => {
          return {
            name: member,
            value: member,
            docs: [enumDescriptions[member]],
          };
        });
        this.members = members;
      }
    }
  }
}
