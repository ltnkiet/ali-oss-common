export interface PutObjectOption {
  domain: string;
  timeout?: number;
}

export interface STSResponse {
  RequestId: string;
  AssumedRoleUser: any;
  Credentials: {
    SecurityToken: string;
    AccessKeyId: string;
    AccessKeySecret: string;
    Expiration: string;
  };
}

export interface CloudStorageClient {
  generateTmpCredentials(sessionId: string): Promise<any>;
  getObjectReadStream(fileName: string): Promise<any>;
  deleteObject(filePath: string): Promise<void>;
  uploadLocalToBucket(
    fileName: string,
    fileData: Buffer,
    options?: PutObjectOption
  ): Promise<string>;
  uploadRemoteObjectToBucket(
    fileName: string,
    remoteUrl: string,
    options?: PutObjectOption
  ): Promise<string>;
}
