/*
 * @Author: wanglinglei
 * @Description: 获取模型文件名称
 * @Date: 2024-09-07 11:10:59
 * @LastEditTime: 2024-09-08 19:32:37
 * @FilePath: /fast-api/src/lib/scripts/utils.ts
 */

export function getModalNameAndKey(string: string): {
  modalFileName: string;
  modalKey: string;
} {
  const keyPaths = string.split("/");
  const keyIndex = keyPaths.indexOf("schemas");
  if (keyIndex > 0) {
    const list = keyPaths.slice(keyIndex + 1, keyPaths.length);
    // 模型名称
    const typekey = list[list.length - 1];
    const modalKey = typekey.charAt(0).toUpperCase() + typekey.slice(1);
    console.log("typekey", typekey, modalKey);

    // 模型所在文件名称
    const modalName = list
      .filter((item) => item !== "/")
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join("");
    return {
      modalFileName: modalName,
      modalKey: modalKey,
    };
  } else {
    return {
      modalFileName: "",
      modalKey: "",
    };
  }
}
