/*
 * @Author: wanglinglei
 * @Description: 文件相关方法
 * @Date: 2024-09-09 09:23:33
 * @LastEditTime: 2024-09-10 17:37:18
 * @FilePath: /personal/fast-api/src/lib/utils/fs.ts
 */

import fs from "fs";

/**
 * @description:  判断文件目录是否存在
 * @param {string} dir
 * @return {*}
 */
export function isExistsDir(dir: string): boolean {
  return fs.existsSync(dir);
}

/**
 * @description: 判断文件目是否存在 不存在就创建目录
 * @param {string} dirPath
 * @return {*}
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * @description: 判断文件是否存在
 * @param {string} filePath
 * @return {*}
 */
export function existsFile(filePath: string): boolean {
  return fs.existsSync(filePath);
}
