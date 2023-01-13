import { BasicCredentials } from '@huaweicloud/huaweicloud-sdk-core';
import { FunctionGraphClient } from "@huaweicloud/huaweicloud-sdk-functiongraph";
import { ICredentials } from "./entity";

export class FgClientFactory {
  static getFgClient(credentials: ICredentials, projectId: string, endpoint: string) {
    return FunctionGraphClient.newBuilder()
      .withCredential(new BasicCredentials()
        .withAk(credentials.AccessKeyID)
        .withSk(credentials.SecretAccessKey)
        .withProjectId(projectId))
      .withEndpoint(endpoint)
      .build();
  }
}
