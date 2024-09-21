import { IComponent } from "../scripts/modal";
import { Property } from "./property";
import { ArrayProperty } from "./arrayProperty";
import { BaseTypeProperty } from "./baseTypeProperty";
import { IDependency } from "./types";

export class ObjectProperty extends Property {
  properties: any[] = [];
  constructor(component: IComponent, key: string) {
    super(component, key);
    this.processProperties(component);
  }

  processProperties(component: IComponent) {
    const { properties } = component;
    if (properties) {
      Object.keys(properties).forEach((key) => {
        const { type, properties: subProperties } = properties[
          key
        ] as IComponent;
        try {
          if (type === "array") {
            // @ts-ignore
            const property = new ArrayProperty(properties[key], key);
            this.processDependency(property.dependency);
            this.properties.push(property);
          } else if (type === "object") {
            // @ts-ignore
            const property = new ObjectProperty(properties[key], key);
            this.processDependency(property.dependency);
            this.properties.push(property);
          } else {
            // @ts-ignore
            const property = new BaseTypeProperty(properties[key], key);
            this.processDependency(property.dependency);
            this.properties.push({
              type: "base",
              key,
              property,
            });
          }
        } catch (error) {
          console.error(`Error processing property ${key}:`, properties[key]);
        }
      });
    }
  }
}
