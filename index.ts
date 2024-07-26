import { readFileSync } from "fs";
import path from "path";
import {
  AlibabaCloudGateway,
  AlibabaCloudGatewayConfig,
} from "./src/alibaba-gateway";

import dotenv from "dotenv";
dotenv.config();

const config: AlibabaCloudGatewayConfig = {
  accessKey: process.env.OSS_ACCESS_KEY || "",
  secret: process.env.OSS_SECRET || "",
  endpoint: "https://sts.aliyuncs.com",
  oss: {
    bucketName: process.env.OSS_BUCKET_NAME || "",
    region: process.env.OSS_REGION || "",
  },
  sts: {
    roleArn: "",
  },
};

const alibabaCloudGateway = new AlibabaCloudGateway(config);

async function uploadFile(fileName: string) {
  try {
    const filePath = path.isAbsolute(fileName) ? fileName : path.resolve(__dirname, fileName);
    const fileData = readFileSync(filePath);

    const uploadedUrl = await alibabaCloudGateway.uploadLocalToBucket(
      path.basename(filePath),
      fileData
    );

    console.log("File uploaded successfully:", uploadedUrl);
  } catch (error) {
    
    console.error("Error uploading file:", error);
  }
}

const fileName = process.argv[2];
if (!fileName) {
  console.error("Please provide a file name as an argument.");
  process.exit(1);
}

uploadFile(fileName);
