import { ListFunctionTriggerResult } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { snakeCase } from 'lodash';
import logger from '../../../common/logger';
import { Trigger } from '../Trigger';

export class ApigTrigger extends Trigger {
  get triggerTypeCode() {
    return 'APIG';
  }

  get triggerName() {
    return snakeCase(`${this.inputs.project.projectName}_ApigTrigger`);
  }

  isMatch(trigger: ListFunctionTriggerResult) {
    return trigger.triggerTypeCode === this.triggerTypeCode && trigger.eventData?.['name'] === this.triggerName;
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
    const group = await this.apigClient.findApigApiGroups(grpName);
    if (!group) {
      const grp = await this.apigClient.createApigApiGroup(grpName);
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
      eventData,
    };
  }
}
