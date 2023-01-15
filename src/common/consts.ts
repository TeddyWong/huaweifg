export const endpoints = (svc: 'functiongraph' | 'apig') => ({
  'af-south-1': `https://${svc}.af-south-1.myhuaweicloud.com`,
  'ap-southeast-2': `https://${svc}.ap-southeast-2.myhuaweicloud.com`,
  'ap-southeast-3': `https://${svc}.ap-southeast-3.myhuaweicloud.com`,
  'cn-east-2': `https://${svc}.cn-east-2.myhuaweicloud.com`,
  'cn-north-4': `https://${svc}.cn-north-4.myhuaweicloud.com`,
  'cn-south-1': `https://${svc}.cn-south-1.myhuaweicloud.com`,
  'ap-southeast-1': `https://${svc}.ap-southeast-1.myhuaweicloud.com`,
  'na-mexico-1': `https://${svc}.na-mexico-1.myhuaweicloud.com`,
  'la-south-2': `https://${svc}.la-south-2.myhuaweicloud.com`,
  'sa-brazil-1': `https://${svc}.sa-brazil-1.myhuaweicloud.com`,
  'ae-ad-1': `https://${svc}.ae-ad-1.myhuaweicloud.com`,
});

export const defaultFunctionConfig = {
  runtime: 'Node.js14.18',
  timeout: 30,
  handler: 'index.handler',
  initializerTimeout: 30,
  memorySize: 4096,
  codeType: 'zip',
  codeFilename: 'fgApp.zip',
};

export type ClassType<T = any> = new (...args: any[]) => T;
