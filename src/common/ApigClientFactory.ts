import { ICredentials, InputProps } from "./entity";
import axios from "axios";
import { endpoints } from "./consts";
import logger from "./logger";
import { cleanName } from "./utils";

const signer = require('./signer');

export class ApigClientFactory {
    static getApigClient(credentials: ICredentials, projectId: string, region: string) {
        return new ApigClient(credentials, projectId, endpoints('apig')[region]);
    }
}

export class ApigClient {
    constructor(private credentials: ICredentials, private projectId: string, private endpoint: string) {
    }

    async listDedicatedGatewayApiGroups(instanceId: string) {
        const opt = createRequestOption(this.credentials, 'GET', `${this.endpoint}/v2/${this.projectId}/apigw/instances/${instanceId}/api-groups`, this.projectId);
        try {
            const { data } = await axios(opt);
            return data.groups;
        } catch (error) {
            logger.error(JSON.stringify(error.response.data, null, 2));
        }
    }

    async findDedicatedGatewayApiGroups(instanceId: string, appName: string) {
        const groups = await this.listDedicatedGatewayApiGroups(instanceId);
        return groups.find((group: any) => group.name === cleanName(appName));
    }

    async listApigApiGroups() {
        const opt = createRequestOption(this.credentials, 'GET', `${this.endpoint}/v1.0/apigw/api-groups`, this.projectId);
        try {
            const { data } = await axios(opt);

            return data.groups;
        } catch (error) {
            logger.error(JSON.stringify(error.response.data, null, 2));
        }
    }

    async findApigApiGroups(appName: string) {
        const groups = await this.listApigApiGroups();
        return groups.find((group: any) => group.name === cleanName(appName));
    }

    async createDedicatedGatewayApiGroup(instanceId: string, appName: string) {
        const opt = createRequestOption(this.credentials, 'POST', `${this.endpoint}/v2/${this.projectId}/apigw/instances/${instanceId}/api-groups`, this.projectId, {
            name: cleanName(appName),
            remark: `For Application ${appName}.`,
        });
        try {
            const { data } = await axios(opt);
            return data;
        } catch (error) {
            logger.error(JSON.stringify(error.response.data, null, 2));
        }
    }

    async createApigApiGroup(appName: string) {
        const opt = createRequestOption(this.credentials, 'POST', `${this.endpoint}/v1.0/apigw/api-groups`, this.projectId, {
            name: cleanName(appName),
            remark: `For Application ${appName}.`,
        });
        try {
            const { data } = await axios(opt);
            return data;
        } catch (error) {
            logger.error(JSON.stringify(error.response.data, null, 2));
        }
    }

}

const createRequestOption = (credentials: ICredentials, method: string, url: string, projectId: string, body?: any) => {
    const sig = new signer.Signer();
    sig.Key = credentials.AccessKeyID;
    sig.Secret = credentials.SecretAccessKey;
    var r = new signer.HttpRequest(method, url);
    r.headers = {
        "Content-Type": "application/json",
        "X-Project-Id": projectId,
    };
    const data = JSON.stringify(body);
    if (body) {
        r.body = data;
    }
    const opt = sig.Sign(r);

    return {
        method,
        url,
        headers: opt.headers,
        data,
    };
}