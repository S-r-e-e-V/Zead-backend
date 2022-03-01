const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
require("dotenv").config();

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_S3_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({ region, accessKeyId, secretAccessKey });

const uploadFile = (file, filename, isBuffer = false) => {
  let fileStream;
  if (isBuffer) {
    fileStream = file.buffer;
  } else {
    fileStream = fs.createReadStream(file.path);
  }

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: filename,
  };

  return s3.upload(uploadParams).promise();
};

// const getFile = (filekey) => {
//   const downloadParams = {
//     Key: filekey,
//     Bucket: bucketName,
//   };
//   return s3.getObject(downloadParams).createReadStream();
// };
module.exports = { uploadFile };
