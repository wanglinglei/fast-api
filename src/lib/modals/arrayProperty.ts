import { IComponent } from "../scripts/modal";
import { Property } from "./property";
import { ObjectProperty } from "./objectProperty";
import { BaseTypeProperty } from "./baseTypeProperty";
import { IDependency } from "./types";

export class ArrayProperty extends Property {
  properties: any = {};

  constructor(component: IComponent, key: string) {
    super(component, key);
    this.processProperties(component);
  }
  valueOf() {
    return {
      properties: this.properties,
    };
  }

  processProperties(component: IComponent) {
    const { items } = component;
    if (items) {
      const { type } = items;
      if (type === "object") {
        const property = new ObjectProperty(items, this.key + "Item");
        this.processDependency(property.dependency);
        this.properties = [property];
      } else {
        const property = new BaseTypeProperty(items, this.key);
        this.processDependency(property.dependency);
        this.properties = [property];
      }
    }
  }
}
