import { ListFunctionTriggerResult } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { snakeCase } from 'lodash';
import { Trigger } from '../Trigger';

export class ObsTrigger extends Trigger {
  get triggerTypeCode() {
    return 'OBS';
  }

  get triggerName() {
    return snakeCase(`${this.inputs.project.projectName}_ObsTrigger`);
  }

  isMatch(trigger: ListFunctionTriggerResult) {
    return trigger.triggerTypeCode === this.triggerTypeCode && trigger.eventData?.['name'] === this.triggerProps.eventData?.['name'];
  }

  async getTriggerData() {
    const eventData = {
      name: this.triggerName,
      ...this.triggerProps.eventData,
    };

    const triggerData = {
      triggerTypeCode: this.triggerTypeCode,
      triggerStatus: this.triggerProps.triggerStatus ?? 'ACTIVE',
      eventData,
    };
    return triggerData;
  }
}
