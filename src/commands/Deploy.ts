import logger from "../common/logger";
import * as core from "@serverless-devs/core";
import { FunctionGraphClient } from "@huaweicloud/huaweicloud-sdk-functiongraph";
import { endpoints } from "../common/consts";
import { InputProps } from "../common/entity";
import { FgClientFactory } from "../common/FgClientFactory";

export class Deploy {
    endpoint: string;
    fgClient: FunctionGraphClient;

    constructor(private inputs: InputProps) {
        this.handleInputs(this.inputs);
        this.fgClient = FgClientFactory.getFgClient(this.inputs.credentials, this.inputs.props.projectId, this.endpoint);
    }

    handleInputs(inputs: InputProps) {
        logger.debug(`inputs.props: ${JSON.stringify(inputs.props, null, 2)}`);

        const props = inputs.props ?? {};

        if (!props.region) {
            throw new Error("Region not found, please input one.");
        }

        this.endpoint = endpoints[props.region];
        if (!this.endpoint) {
            throw new Error(`Wrong region.`);
        }

        const projectId = props.projectId;
        if (!projectId) {
            throw new Error(`ProjectId not found.`);
        }

        logger.info(`Using region:${props.region}`);

    }

    async run() {

    }
}