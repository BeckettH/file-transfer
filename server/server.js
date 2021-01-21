const express = require('express');
const path = require('path');
const aws = require('aws-sdk');
const dotenv = require('dotenv');

// if this were deployed, we could set this to only use dotenv variables if we're in dev mode
dotenv.config();

const app = express();

const s3Bucket = process.env.BUCKET;

aws.config.update({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  endpoint: process.env.ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// serve up static assets
app.use(express.static('./client'));

// serve up home page (which will default to being the upload page)
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

// if there's time, replace processing stuff inside routes with separate controller files
// for example, use a signRequestController for any requests to the /sign-s3 route
// app.get('/sign-s3', signRequestController);

// get a signed url to upload to the S3 bucket
app.get('/sign-s3', (req, res) => {
  console.log('entering sign-s3 route');
  const s3 = new aws.S3();
  const { fileName, fileType } = req.query;
  const uploadParams = {
    Bucket: s3Bucket,
    Key: fileName,
    Expires: 360, // how many seconds the signed url is valid for - increase this if it's not long enough for larger files
    ContentType: fileType,
    ACL: 'public-read',
  };

  console.log(`s3 params are ${JSON.stringify(uploadParams)}`);

  // make a request to the S3 API to get a signed URL which we can use to upload our file
  s3.getSignedUrl('putObject', uploadParams, (err, data) => {
    if (err) {
      console.log(`Error getting signed url from S3: ${err}`);
      return res.end();
    }
    // sending back the url of the signedRequest and a URL where we can access the content after its saved
    const returnData = {
      signedRequest: data,
      // url may not be needed
      url: `https://gateway.tardigradeshare.io/${s3Bucket}/${fileName}`,
      fileName,
    };
    console.log(JSON.stringify(returnData));
    // send back the data
    res.write(JSON.stringify(returnData));
    res.end();
  });
});

// get an uploaded file
app.get('/get-file', async (req, res) => {
  console.log('entering get-file route');
  const s3 = new aws.S3();
  const { fileName } = req.query;
  const getParams = {
    Bucket: s3Bucket,
    Key: fileName,
  };

  console.log(`'get' params are ${JSON.stringify(getParams)}`);

  const downloadUrl = await new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', getParams, (err, url) => {
      if (err) {
        reject(err);
      }
      resolve(url);
    });
  });

  console.log('downloadUrl is ', downloadUrl);

  res.write(JSON.stringify({ downloadUrl }));
  res.end();
});

// catch 404 errors
app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

// error handler
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || 3000);
