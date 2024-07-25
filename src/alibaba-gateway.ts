import OSS from "ali-oss";
import axios, { HttpStatusCode } from "axios";
import Core from "@alicloud/pop-core";
import { Writable } from "stream";

import { CloudStorageClient, PutObjectOption, STSResponse } from "./interfaces";

export interface AlibabaCloudGatewayConfig {
  accessKey: string;
  secret: string;
  apiVersion?: string;
  endpoint: string;
  timeout?: number;
  oss: {
    bucketName: string;
    region: string;
  };
  sts: {
    roleArn: string;
  };
}

export class AlibabaCloudGateway implements CloudStorageClient {
  protected coreClient: Core;
  protected ossClient: OSS;

  constructor(protected config: AlibabaCloudGatewayConfig) {
    this.coreClient = new Core({
      accessKeyId: config.accessKey,
      accessKeySecret: config.secret,
      apiVersion: config.apiVersion || "2015-04-01",
      endpoint: config.endpoint,
    });

    this.ossClient = new OSS({
      accessKeyId: config.accessKey,
      accessKeySecret: config.secret,
      region: config.oss.region,
      bucket: config.oss.bucketName,
      timeout: config.timeout || 3000,
    });
  }

  public async generateTmpCredentials(
    sessionID: string
  ): Promise<STSResponse["Credentials"]> {
    const requestResponse: STSResponse = await this.coreClient.request(
      "AssumeRole",
      {
        RoleArn: this.config.sts.roleArn,
        RoleSessionName: sessionID,
        DurationSeconds: this.config.timeout || 900,
      },
      {
        method: "POST",
        contentType: "application/json",
      }
    );

    return requestResponse.Credentials;
  }

  public async uploadLocalToBucket(
    fileName: string,
    fileData: Buffer,
    options?: PutObjectOption
  ): Promise<string> {
    const putResult = await this.ossClient.put(fileName, fileData, {
      timeout: options?.timeout || 15000, // 15s
    });

    if (options?.domain) {
      return `${options.domain}/${fileName}`;
    }

    if (putResult?.url?.includes("http://")) {
      return putResult.url.replace("http://", "https://");
    }

    return putResult.url;
  }

  public async deleteObject(filePath: string): Promise<void> {
    await this.ossClient.delete(filePath);
  }

  public async uploadRemoteObjectToBucket(
    fileName: string,
    remoteUrl: string,
    options?: PutObjectOption
  ): Promise<string> {
    const response = await axios.get(remoteUrl, { responseType: "stream" });
    if (response.status !== HttpStatusCode.Ok) {
      throw new Error("failed to fetch from remote url");
    }

    const { data } = response;

    const putResult = await this.ossClient.put(fileName, data, {
      timeout: options?.timeout || 15000, // 15s
    });

    if (options?.domain) {
      return `${options.domain}/${fileName}`;
    }

    if (putResult?.url?.includes("http://")) {
      return putResult.url.replace("http://", "https://");
    }

    return putResult.url;
  }

  public getObjectReadStream(fileName: string): Promise<OSS.GetStreamResult> {
    return this.ossClient.getStream(fileName);
  }

  public writeFileToDestination(
    fileName: string,
    destination: string | Writable
  ): Promise<OSS.GetObjectResult> {
    return this.ossClient.get(fileName, destination);
  }
}
