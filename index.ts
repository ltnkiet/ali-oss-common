import OSS from 'ali-oss';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .command('upload <filePath>', 'Upload a file to OSS', (yargs) => {
    yargs.positional('filePath', {
      describe: 'Path of the file to upload',
      type: 'string',
    });
  })
  .help()
  .parseSync();

const client = new OSS({
  accessKeyId: process.env.OSS_ACCESS_KEY || '',
  accessKeySecret: process.env.OSS_SECRET || '',
  region: process.env.OSS_REGION || '',
  bucket: process.env.OSS_BUCKET_NAME || '',
});

async function uploadFile(filePath: string) {
  try {
    const fileName = path.basename(filePath);
    const result = await client.put(fileName, filePath);

    console.log(`File uploaded successfully: ${result.url}`);
  } catch (err) {
    
    console.error('Error uploading file:', err);
  }
}


if (argv._[0] === 'upload' && argv.filePath) {
  uploadFile(argv.filePath as string);
} else {

  console.error('Please provide a valid file path.');
}
