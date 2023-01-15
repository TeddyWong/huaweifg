import fs from 'fs';
import JSZip from 'jszip';
import { assign, camelCase, map, snakeCase, upperFirst } from 'lodash';
import path from 'path';
import logger from '../common/logger';
import { ClassType } from './consts';
const zip = new JSZip();

function readDir(zip: JSZip, nowPath: string, targetDir: string) {
  try {
    const pathDir = nowPath.split('/');
    const _dir = pathDir[pathDir.length - 1];
    if (_dir.includes('.')) {
      zip.file(_dir, fs.readFileSync(`${nowPath}`));
    } else {
      const files = fs.readdirSync(nowPath);
      files.forEach((fileName, index) => {
        const fillPath = nowPath + '/' + fileName;
        const file = fs.statSync(fillPath);
        if (file.isDirectory()) {
          const dirlist = zip.folder(path.relative(targetDir, fillPath));
          if (dirlist) {
            readDir(dirlist, fillPath, targetDir);
          }
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
  const tempFileName = './temp.zip';
  const targetDir = path.resolve(codePath);
  try {
    readDir(zip, targetDir, targetDir);
    const data = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    fs.writeFileSync(tempFileName, data);
    const base64 = Buffer.from(data).toString('base64');
    fs.unlinkSync(tempFileName);
    return base64;
  } catch (e) {
    logger.error('File does not exist or file is invalid. please check');
  }
}

export const copyByWithX = <T>(src: any, dest: T) => {
  if (src) {
    Object.keys(src).forEach((key) => {
      if (typeof dest[`with${upperFirst(key)}`] === 'function') {
        dest[`with${upperFirst(key)}`](src[key]);
      }
    });
  }
  return dest;
};

export const cleanName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
};

// export const sdkResponseModelPatch = <T>(ModelClass: ClassType<T>, resultObjs?: T[]) => {
//   if (resultObjs) {
//     return map(resultObjs, (resultObj) => {
//       const model = new ModelClass();
//       return assign(model, resultObj);
//     });
//   } else {
//     return [];
//   }
// };

export const toCamelCaseArray = <T = any>(resultObjs?: T[]) => {
  if (resultObjs) {
    return map(resultObjs, (resultObj) => toCamelCase(resultObj));
  } else {
    return [];
  }
};

export const toCamelCase = (obj?: any) => {
  if (!obj) return obj;
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    const newKey = camelCase(key);
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[newKey] = toCamelCase(obj[key]);
    } else {
      newObj[newKey] = obj[key];
    }
  });
  return newObj;
};

export const toSnakeCase = (obj: any) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    const newKey = snakeCase(key);
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[newKey] = toSnakeCase(obj[key]);
    } else {
      newObj[newKey] = obj[key];
    }
  });
  return newObj;
};
