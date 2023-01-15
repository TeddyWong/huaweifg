import { CreateFunctionTriggerRequest, CreateFunctionTriggerRequestBody, FunctionGraphClient, ListFunctionTriggerResult, ListFunctionTriggersRequest } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import * as core from '@serverless-devs/core';
import { find } from 'lodash';
import { ApigClient } from '../../common/ApigClientFactory';
import { InputProps } from '../../common/entity';
import logger from '../../common/logger';
import { copyByWithX, toCamelCaseArray, toSnakeCase } from '../../common/utils';

export abstract class Trigger {
  constructor(protected fgClient: FunctionGraphClient, protected apigClient: ApigClient, protected triggerProps: any, protected funcUrn: string, protected inputs: InputProps) {}

  abstract get triggerTypeCode(): string;

  abstract isMatch(trigger: ListFunctionTriggerResult): boolean;

  abstract getTriggerData(): Promise<any>;

  async listFunctionTriggers(funcUrn: string) {
    const triggers = toCamelCaseArray(await this.fgClient.listFunctionTriggers(new ListFunctionTriggersRequest().withFunctionUrn(funcUrn)));
    return triggers;
  }

  async findExistingTrigger(funcUrn: string) {
    const triggers = await this.listFunctionTriggers(funcUrn);
    return find(triggers, (trigger) => this.isMatch(trigger));
  }

  async createFunctionTrigger(funcUrn: string) {
    const triggerData = await this.getTriggerData();
    logger.debug(JSON.stringify(triggerData, null, 2));
    const vm = core.spinner(`Creating trigger ${triggerData.eventData.name} ...`);
    const body = copyByWithX(triggerData, new CreateFunctionTriggerRequestBody());
    body.withEventData(toSnakeCase(triggerData.eventData));
    const resp = await this.fgClient.createFunctionTrigger(new CreateFunctionTriggerRequest().withFunctionUrn(funcUrn).withBody(body));
    logger.debug(JSON.stringify(resp, null, 2));
    vm.succeed(`Trigger ${triggerData.eventData.name} created`);
  }
}
