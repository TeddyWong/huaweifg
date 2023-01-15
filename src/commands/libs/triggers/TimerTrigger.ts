import { ListFunctionTriggerResult } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { snakeCase } from 'lodash';
import { Trigger } from '../Trigger';

export class TimerTrigger extends Trigger {
  get triggerTypeCode() {
    return 'TIMER';
  }

  get triggerName() {
    return snakeCase(`${this.inputs.project.projectName}_TimerTrigger`);
  }

  isMatch(trigger: ListFunctionTriggerResult) {
    return trigger.triggerTypeCode === this.triggerTypeCode && trigger.eventData?.['name'] === this.triggerProps.eventData?.['name'];
  }

  async getTriggerData() {
    const eventData = {
      name: this.triggerName,
      schedule: '10m',
      scheduleType: 'Rate',
      ...this.triggerProps.eventData,
    };

    return {
      triggerTypeCode: this.triggerTypeCode,
      triggerStatus: this.triggerProps.triggerStatus ?? 'ACTIVE',
      eventData,
    };
  }
}
