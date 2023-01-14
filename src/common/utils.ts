import { upperFirst } from "lodash";
import logger from "../common/logger";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
let zip = new JSZip();

async function readDir(zip: JSZip, nowPath: string, targetDir: string) {
  try {
    const pathDir = nowPath.split("/");
    const _dir = pathDir[pathDir.length - 1];
    if (_dir.includes(".")) {
      zip.file(_dir, fs.readFileSync(`${nowPath}`));
    } else {
      let files = fs.readdirSync(nowPath);
      files.forEach((fileName, index) => {
        let fillPath = nowPath + "/" + fileName;
        let file = fs.statSync(fillPath);
        if (file.isDirectory()) {
          let dirlist = zip.folder(path.relative(targetDir, fillPath));
          readDir(dirlist, fillPath, targetDir);
        } else {
          zip.file(fileName, fs.readFileSync(fillPath));
        }
      });
    }
  } catch (e) {
    logger.error(e);
  }
}

export async function archiveBase64(codePath: string) {
  const tempFileName = "./temp.zip";
  const targetDir = path.resolve(codePath);
  try {
    await readDir(zip, targetDir, targetDir);
    const data = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
    fs.writeFileSync(tempFileName, data);
    const base64 = Buffer.from(data).toString("base64");
    fs.unlinkSync(tempFileName);
    return base64;
  } catch (e) {
    logger.error("File does not exist or file is invalid. please check");
  }
}

export const copyByWithX = <T>(src: any, dest: T) => {
  if (src) {
    Object.keys(src).forEach((key) => {
      if (typeof dest[`with${upperFirst(key)}`] === 'function') {
        dest[`with${upperFirst(key)}`](src[key]);
      }
    });
    return dest;
  }
}

export const cleanName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}