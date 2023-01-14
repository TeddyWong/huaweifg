import logger from "../../../common/logger";
import { Trigger } from "../Trigger";

export class ApigTrigger extends Trigger {
    async getEventData() {
        const eventData = {
            groupId: '',
            slDomain: '',
            envName: "RELEASE",
            envId: "DEFAULT_ENVIRONMENT_RELEASE_ID",
            auth: "NONE",
            protocol: "HTTPS",
            name: `${this.inputs.project.projectName}_Trigger`,
            path: `/${this.inputs.project.projectName}`,
            matchMode: "SWA",
            reqMethod: "ANY",
            backendType: "FUNCTION",
            type: 1,
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

        return eventData;
    }
}
