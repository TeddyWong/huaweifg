import { FunctionGraphClient } from "@huaweicloud/huaweicloud-sdk-functiongraph";
import { ApigClient } from "../../common/ApigClientFactory";
import { ClassType } from "../../common/consts";
import { InputProps } from "../../common/entity";
import { Trigger } from "./Trigger";
import { ApigTrigger } from "./triggers/ApigTrigger";
import { DedicatedGatewayTrigger } from "./triggers/DedicatedGatewayTrigger";

export class TriggerFactory {
    private registry = new Map<string, ClassType<Trigger>>();
    private static instance: TriggerFactory;

    private constructor() {
        this.registerTrigger("APIG", ApigTrigger);
        this.registerTrigger("DEDICATEDGATEWAY", DedicatedGatewayTrigger);
    }

    static getInstance() {
        if (!TriggerFactory.instance) {
            TriggerFactory.instance = new TriggerFactory();
        }
        return TriggerFactory.instance;
    }

    registerTrigger<T extends Trigger>(triggerTypeCode: string, triggerClass: ClassType<T>) {
        this.registry.set(triggerTypeCode, triggerClass);
        return TriggerFactory;
    }

    getTrigger(triggerTypeCode: string, fgClient: FunctionGraphClient, apigClient: ApigClient, triggerProps: any, inputs: InputProps, funcUrn: string) {
        const triggerClass = this.registry.get(triggerTypeCode);
        if (!triggerClass) {
            throw new Error(`Trigger type ${triggerTypeCode} is not supported.`);
        }
        return new triggerClass().withFgClient(fgClient).withApigClient(apigClient).withTriggerProps(triggerProps).withInputs(inputs).withFuncUrn(funcUrn);
    }
}

