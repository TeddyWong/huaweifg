import { FunctionGraphClient } from "@huaweicloud/huaweicloud-sdk-functiongraph";
import { ApigClient } from "../../common/ApigClientFactory";
import { InputProps } from "../../common/entity";

export abstract class Trigger {
    protected fgClient: FunctionGraphClient;
    protected apigClient: ApigClient;
    protected triggerProps: any;
    protected funcUrn: string;
    protected inputs: InputProps;

    withFgClient(fgClient: FunctionGraphClient) {
        this.fgClient = fgClient;
        return this;
    }

    withApigClient(apigClient: ApigClient) {
        this.apigClient = apigClient;
        return this;
    }

    withTriggerProps(triggerProps: any) {
        this.triggerProps = triggerProps;
        return this;
    }

    withInputs(inputs: InputProps) {
        this.inputs = inputs;
        return this;
    }

    withFuncUrn(funcUrn: string) {
        this.funcUrn = funcUrn;
        return this;
    }

    abstract getEventData(): Promise<any>;
}
