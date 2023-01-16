import {
  CreateFunctionRequest,
  CreateFunctionRequestBody,
  FuncCode,
  FunctionGraphClient,
  FuncVpc,
  ListFunctionsRequest,
  UpdateFunctionCodeRequest,
  UpdateFunctionCodeRequestBody,
  UpdateFunctionConfigRequest,
  UpdateFunctionConfigRequestBody,
} from '@huaweicloud/huaweicloud-sdk-functiongraph';
import * as core from '@serverless-devs/core';
import { find } from 'lodash';
import { InputProps } from '../../common/entity';
import logger from '../../common/logger';
import { archiveBase64, copyByWithX, toCamelCaseArray } from '../../common/utils';
import { toCamelCase } from './../../common/utils';

export class FgFunction {
  constructor(private inputs: InputProps, private fgClient: FunctionGraphClient) {}

  async findExistingFunction() {
    const functionName = this.inputs.props.function.funcName;
    const vm1 = core.spinner(`Checking if ${functionName} exits...`);
    const fns = await this.fgClient.listFunctions(new ListFunctionsRequest().withPackageName(this.inputs.props.function.packageName));
    fns.functions = toCamelCaseArray(fns.functions);
    const fn = find(fns.functions, (fn) => fn.funcName === functionName);
    if (fn) {
      vm1.succeed(`Function ${functionName} is already online.`);
      return fn.funcUrn;
    } else {
      vm1.succeed(`Function ${functionName} does not exitst.`);
    }
  }

  async deployFunction() {
    const vm = core.spinner(`Archiving code in path ${this.inputs.props.function.distDir}...`);
    const fileBaes64 = await archiveBase64(this.inputs.props.function.distDir);
    if (!fileBaes64) {
      throw new Error('File compression failed');
    }
    vm.succeed('File compression completed');
    const body = copyByWithX(this.inputs.props.function, new CreateFunctionRequestBody());
    const funcVpc = copyByWithX(this.inputs.props.function.funcVpc, new FuncVpc());
    if (funcVpc) {
      body.withFuncVpc(funcVpc);
    }
    body.withFuncCode(new FuncCode().withFile(fileBaes64));
    logger.debug(JSON.stringify(body, null, 2));
    const vm1 = core.spinner(`Deploying function ${body.funcName} ...`);
    const result = toCamelCase(await this.fgClient.createFunction(new CreateFunctionRequest().withBody(body)));
    vm1.succeed(`Function ${body.funcName} deployed successfully.`);
    return result.funcUrn;
  }

  async updateFunction(funcUrn: string) {
    const vm = core.spinner('Archiving code...');
    const fileBaes64 = await archiveBase64(this.inputs.props.function.distDir);
    if (!fileBaes64) {
      throw new Error('File compression failed');
    }
    vm.succeed('File compression completed');
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
