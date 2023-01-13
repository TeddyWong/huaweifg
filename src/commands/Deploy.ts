import { CreateFunctionRequest, CreateFunctionRequestBody, FuncCode, FunctionGraphClient, FuncVpc, ListFunctionResult, ListFunctionsRequest, UpdateFunctionCodeRequest, UpdateFunctionCodeRequestBody, UpdateFunctionConfigRequest, UpdateFunctionConfigRequestBody } from "@huaweicloud/huaweicloud-sdk-functiongraph";
import * as core from "@serverless-devs/core";
import { assign, upperFirst, find } from "lodash";
import { defaultFunctionConfig, endpoints } from "../common/consts";
import { InputProps } from "../common/entity";
import { FgClientFactory } from "../common/FgClientFactory";
import logger from "../common/logger";
import { archiveBase64, copyByWithX } from "../common/utils";

export class Deploy {
    endpoint: string;
    fgClient: FunctionGraphClient;
    inputs: InputProps;

    constructor(inputs: InputProps) {
        this.inputs = inputs;
        this.handleInputs();
        this.fgClient = FgClientFactory.getFgClient(this.inputs.credentials, this.inputs.props.projectId, this.endpoint);
    }

    private handleInputs() {
        logger.debug(`inputs.props: ${JSON.stringify(this.inputs, null, 2)}`);

        this.inputs.props.function = assign(
            defaultFunctionConfig,
            {
                funcName: this.inputs.project.projectName,
                package: this.inputs.appName,
                description: `${this.inputs.project.projectName} API Service`,
                distDir: './dist',
                codeFilename: `${this.inputs.project.projectName}.zip`,
            },
            this.inputs.props.function ?? {},
        )
        const props = this.inputs.props;
        logger.debug(`Merged inputs.props: ${JSON.stringify(this.inputs, null, 2)}`);

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
        // Create or update function
        let funcUrn = await this.isFunctionExists();
        if (funcUrn) {
            await this.updateFunction(funcUrn);
        } else {
            funcUrn = await this.deployFunction();
        }

        // Create or update trigger

    }

    async isFunctionExists() {
        const functionName = this.inputs.props.function.funcName;
        const vm1 = core.spinner(`Checking if ${functionName} exits...`);
        const fns = await this.fgClient.listFunctions(new ListFunctionsRequest().withPackageName(this.inputs.props.function.packageName));
        const fn = find(fns.functions, (fn) => fn.funcName === functionName);
        if (fn) {
            vm1.succeed(`Function ${functionName} is already online.`);
            return fn['func_urn'];
        } else {
            vm1.succeed(`Function ${functionName} does not exitst.`);
        }
    }

    async deployFunction() {
        const vm = core.spinner("Archiving code...");
        const fileBaes64 = await archiveBase64(this.inputs.props.function.distDir);
        vm.succeed("File compression completed");
        const body = copyByWithX(this.inputs.props.function, new CreateFunctionRequestBody());
        const funcVpc = copyByWithX(this.inputs.props.function.funcVpc, new FuncVpc());
        if (funcVpc) {
            body.withFuncVpc(funcVpc);
        }
        body.withFuncCode(new FuncCode().withFile(fileBaes64));
        logger.debug(JSON.stringify(body, null, 2));
        const vm1 = core.spinner(`Deploying function ${body.funcName} ...`);
        const result = await this.fgClient.createFunction(new CreateFunctionRequest().withBody(body));
        vm1.succeed(`Function ${body.funcName} deployed successfully.`);
        return result['func_urn'];
    }

    async updateFunction(funcUrn: string) {
        const vm = core.spinner("Archiving code...");
        const fileBaes64 = await archiveBase64(this.inputs.props.function.distDir);
        vm.succeed("File compression completed");
        const body = copyByWithX(this.inputs.props.function, new UpdateFunctionConfigRequestBody());
        const funcVpc = copyByWithX(this.inputs.props.function.funcVpc, new FuncVpc());
        if (funcVpc) {
            body.withFuncVpc(funcVpc);
        }

        logger.debug(JSON.stringify(body, null, 2));
        const vm1 = core.spinner(`Updating function ${body.funcName} ...`);
        await this.fgClient.updateFunctionConfig(new UpdateFunctionConfigRequest().withFunctionUrn(funcUrn).withBody(body));
        const codeBody = copyByWithX(this.inputs.props.function, new UpdateFunctionCodeRequestBody());
        codeBody.withFuncCode(new FuncCode().withFile(fileBaes64));
        await this.fgClient.updateFunctionCode(new UpdateFunctionCodeRequest(funcUrn).withBody(codeBody));
        vm1.succeed(`Function ${body.funcName} updated successfully.`);
    }
}