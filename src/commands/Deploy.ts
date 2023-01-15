import { FunctionGraphClient } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import * as core from '@serverless-devs/core';
import { assign, map } from 'lodash';
import { ApigClient, ApigClientFactory } from '../common/ApigClientFactory';
import { defaultFunctionConfig, endpoints } from '../common/consts';
import { InputProps } from '../common/entity';
import { FgClientFactory } from '../common/FgClientFactory';
import logger from '../common/logger';
import { FgFunction } from './libs/FgFunction';
import { TriggerFactory } from './libs/TriggerFactory';

export class Deploy {
  private fgClient: FunctionGraphClient;

  private apigClient: ApigClient;

  private fgFunction: FgFunction;

  private triggerFactory: TriggerFactory;

  constructor(private inputs: InputProps) {
    this.handleInputs();
    this.fgClient = FgClientFactory.getFgClient(this.inputs.credentials, this.inputs.props.projectId, this.inputs.props.region);
    this.apigClient = ApigClientFactory.getApigClient(this.inputs.credentials, this.inputs.props.projectId, this.inputs.props.region);
    this.fgFunction = new FgFunction(this.inputs, this.fgClient);
    this.triggerFactory = TriggerFactory.getInstance(this.fgClient, this.apigClient);
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
    );
    const props = this.inputs.props;
    logger.debug(`Merged inputs.props: ${JSON.stringify(this.inputs, null, 2)}`);

    if (!props.region) {
      throw new Error('Region not found, please input one.');
    }

    const endpoint = endpoints('functiongraph')[props.region];
    if (!endpoint) {
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
    let funcUrn = await this.fgFunction.findExistingFunction();
    if (funcUrn) {
      await this.fgFunction.updateFunction(funcUrn);
    } else {
      funcUrn = await this.fgFunction.deployFunction();
    }
    if (funcUrn) {
      // Create or update trigger
      for (const triggerProps of this.inputs.props.triggers) {
        const trigger = this.triggerFactory.getTrigger(triggerProps.triggerTypeCode, triggerProps, this.inputs, funcUrn);
        const existingTrigger = await trigger.findExistingTrigger(funcUrn);
        const vm = core.spinner(`Checking if trigger[${trigger.triggerTypeCode}] of ${this.inputs.props.function.funcName} exists ...`);
        if (!existingTrigger) {
          vm.succeed(`Trigger[${trigger.triggerTypeCode}] not found`);
          await trigger.createFunctionTrigger(funcUrn);
        } else {
          vm.succeed(`Trigger[${trigger.triggerTypeCode}] of ${this.inputs.props.function.funcName} already exists, skip creating. If you want to update the trigger, please delete it first.`);
        }
      }
      // await Promise.all(
      //   map(this.inputs.props.triggers, async (triggerProps) => {
      //     const trigger = this.triggerFactory.getTrigger(triggerProps.triggerTypeCode, triggerProps, this.inputs, funcUrn!);
      //     const existingTrigger = await trigger.findExistingTrigger(funcUrn!);
      //     const vm = core.spinner(`Checking if trigger[${trigger.triggerTypeCode}] of ${this.inputs.props.function.funcName} exists ...`);
      //     if (!existingTrigger) {
      //       vm.succeed(`Trigger[${trigger.triggerTypeCode}] not found`);
      //       await trigger.createFunctionTrigger(funcUrn!);
      //     } else {
      //       vm.succeed(`Trigger[${trigger.triggerTypeCode}] of ${this.inputs.props.function.funcName} already exists, skip creating. If you want to update the trigger, please delete it first.`);
      //     }
      //   }),
      // );
    }
  }
}
