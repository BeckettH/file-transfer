# file-transfer
Current version: A simple application that allows someone to anonymously upload a file through an Amazon S3 endpoint, and then spits out a link that can be used to download that file.

To run:
1. Do an "npm install"
2. Add the following S3 endpoint details to a .env file at the top level of the project: ENDPOINT, ACCESSKEYID, SECRETACCESSKEY, BUCKET
3. Run "npm run build" to build the app using webpack
4. Run "npm run dev" to start up the dev server
5. Visit localhost:8080 to test out the application

Future updates:
1. Generate a unique string to associate with the uploaded file (and potentially rename the file to use that string as well so it can be the unique key in S3 for that file). 
2. Create a Download component on a /download route and have it check with the application storage (possibly Redis) to see if the unique string passed through query parameters exists in the store,. If it does, it should use the "getDownloadUrl" function along with the filename stored with it to get a signed URL for the end user (person trying to download the file) so they can access the download.
3. Update the upload component to give the actual shareable URL to the uploader rather than the temporary signed S3 url.
4. Add two fields to the upload process to allow uploaders to set optional limits on the file upload for how many times it can be downloaded and when the download should expire (maybe number of days and hours), and then add that information to the application storage along with the file so each file has its own record of when it should expire.
5. Keep track for every file of whether its download or time limit has been reached. Once either limit is hit for a download, delete the object from S3 and then remove the record from the application storage.