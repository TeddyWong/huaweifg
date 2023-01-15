import { ListFunctionTriggerResult } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { snakeCase } from 'lodash';
import logger from '../../../common/logger';
import { Trigger } from '../Trigger';

export class DedicatedGatewayTrigger extends Trigger {
  get triggerTypeCode() {
    return 'DEDICATEDGATEWAY';
  }

  get triggerName() {
    return snakeCase(`${this.inputs.project.projectName}_DedicatedGatewayTrigger`);
  }

  isMatch(trigger: ListFunctionTriggerResult) {
    return trigger.triggerTypeCode === this.triggerTypeCode && trigger.eventData?.['instanceId'] === this.triggerProps.eventData.instanceId && trigger.eventData?.['name'] === this.triggerName;
  }

  async getTriggerData() {
    const eventData = {
      groupId: '',
      slDomain: '',
      envName: 'RELEASE',
      envId: 'DEFAULT_ENVIRONMENT_RELEASE_ID',
      auth: 'NONE',
      protocol: 'HTTPS',
      name: this.triggerName,
      path: `/${this.inputs.project.projectName}`,
      matchMode: 'SWA',
      reqMethod: 'ANY',
      backendType: 'FUNCTION',
      type: 1,
      ...this.triggerProps.eventData,
    };
    const grpName = this.inputs.appName;
    const instanceId = this.triggerProps.eventData.instanceId;
    if (!instanceId) {
      throw new Error(`Dedicated gateway instanceId is not found online.`);
    }
    const group = await this.apigClient.findDedicatedGatewayApiGroups(instanceId, grpName);

    if (!group) {
      const grp = await this.apigClient.createDedicatedGatewayApiGroup(instanceId, grpName);
      logger.debug('group created');
      logger.debug(JSON.stringify(grp, null, 2));
      eventData.groupId = grp.id;
      eventData.slDomain = grp.sl_domain;
    } else {
      logger.debug('group already exists');
      logger.debug(JSON.stringify(group, null, 2));
      eventData.groupId = group.id;
      eventData.slDomain = group.sl_domain;
    }

    return {
      triggerTypeCode: this.triggerTypeCode,
      triggerStatus: this.triggerProps.triggerStatus ?? 'ACTIVE',
      instanceId,
      eventData,
    };
  }
}
