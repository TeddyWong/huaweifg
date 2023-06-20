import { FunctionGraphClient } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { ApigClient } from '../../common/ApigClientFactory';
import { ClassType } from '../../common/consts';
import { InputProps } from '../../common/entity';
import { Trigger } from './Trigger';
import { ApigTrigger } from './triggers/ApigTrigger';
import { DedicatedGatewayTrigger } from './triggers/DedicatedGatewayTrigger';
import { ObsTrigger } from './triggers/ObsTrigger';
import { TimerTrigger } from './triggers/TimerTrigger';

export class TriggerFactory {
  private registry = new Map<string, ClassType<Trigger>>();

  private static instance: TriggerFactory;

  private constructor(private fgClient: FunctionGraphClient, private apigClient: ApigClient) {
    this.registerTrigger(ApigTrigger);
    this.registerTrigger(DedicatedGatewayTrigger);
    this.registerTrigger(TimerTrigger);
    this.registerTrigger(ObsTrigger);
  }

  static getInstance(fgClient: FunctionGraphClient, apigClient: ApigClient) {
    if (!TriggerFactory.instance) {
      TriggerFactory.instance = new TriggerFactory(fgClient, apigClient);
    }
    return TriggerFactory.instance;
  }

  registerTrigger<T extends Trigger>(TriggerClass: ClassType<T>) {
    const triggerTypeCode = new TriggerClass().triggerTypeCode;
    this.registry.set(triggerTypeCode, TriggerClass);
    return TriggerFactory;
  }

  getTrigger(triggerTypeCode: string, triggerProps: any, inputs: InputProps, funcUrn: string) {
    const TriggerClass = this.registry.get(triggerTypeCode);
    if (!TriggerClass) {
      throw new Error(`Trigger type ${triggerTypeCode} is not supported.`);
    }
    return new TriggerClass(this.fgClient, this.apigClient, triggerProps, funcUrn, inputs);
  }
}
