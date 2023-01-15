import { BasicCredentials } from '@huaweicloud/huaweicloud-sdk-core';
import { FunctionGraphClient } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { endpoints } from './consts';
import { ICredentials } from './entity';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FgClientFactory {
  static getFgClient(credentials: ICredentials, projectId: string, region: string) {
    return FunctionGraphClient.newBuilder().withCredential(new BasicCredentials().withAk(credentials.AccessKeyID).withSk(credentials.SecretAccessKey).withProjectId(projectId)).withEndpoint(endpoints('functiongraph')[region]).build();
  }
}
