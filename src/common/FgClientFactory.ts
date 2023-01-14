import { FunctionGraphClient } from '@huaweicloud/huaweicloud-sdk-functiongraph';
import { BasicCredentials } from '@huaweicloud/huaweicloud-sdk-core';
import { ICredentials } from "./entity";
import { endpoints } from './consts';

export class FgClientFactory {
  static getFgClient(credentials: ICredentials, projectId: string, region: string) {
    return FunctionGraphClient.newBuilder()
      .withCredential(new BasicCredentials()
        .withAk(credentials.AccessKeyID)
        .withSk(credentials.SecretAccessKey)
        .withProjectId(projectId))
      .withEndpoint(endpoints('functiongraph')[region])
      .build();
  }
}
