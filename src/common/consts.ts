export const endpoints = {
    "af-south-1": "https://functiongraph.af-south-1.myhuaweicloud.com",
    "ap-southeast-2": "https://functiongraph.ap-southeast-2.myhuaweicloud.com",
    "ap-southeast-3": "https://functiongraph.ap-southeast-3.myhuaweicloud.com",
    "cn-east-2": "https://functiongraph.cn-east-2.myhuaweicloud.com",
    "cn-north-4": "https://functiongraph.cn-north-4.myhuaweicloud.com",
    "cn-south-1": "https://functiongraph.cn-south-1.myhuaweicloud.com",
    "ap-southeast-1": "https://functiongraph.ap-southeast-1.myhuaweicloud.com",
    "na-mexico-1": "https://functiongraph.na-mexico-1.myhuaweicloud.com",
    "la-south-2": "https://functiongraph.la-south-2.myhuaweicloud.com",
    "sa-brazil-1": "https://functiongraph.sa-brazil-1.myhuaweicloud.com",
    "ae-ad-1": "https://functiongraph.ae-ad-1.myhuaweicloud.com",
}

export const defaultFunctionConfig = {
    runtime: "Node.js14.18",
    timeout: 30,
    handler: "index.handler",
    memorySize: 4096,
    codeType: "zip",
    codeFilename: "fgApp.zip",
}