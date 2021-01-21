import React, { useState } from 'react';

const Upload = () => {
  // const [setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // this is how we get the signed url for the specific file upload
  const getSignedRequest = (file) => {
    console.log('inside get signed request on frontend');
    return fetch(`/sign-s3?fileName=${file.name}&fileType=${file.type}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        return res.json();
      });
  };

  // this is what uploadToS3 uses to actually upload the file using the signed request
  // this piece is happening on the frontend to avoid using extra time/space to
  // upload to the server and then S3
  const uploadFile = (file, signedRequest, url) => {
    console.log('inside upload file and signed request is ', signedRequest);

    return fetch(signedRequest, {
      method: 'PUT',
      body: file,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        // return res.url;
      });
  };

  // this is what uploadToS3 uses to actually upload the file using the signed request
  const getDownloadUrl = (fileName) => {
    console.log('inside get download url function and filename is ', fileName);

    return fetch(`/get-file?fileName=${fileName}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        return res.json();
      });
  };

  // chain together getting the signed request url, using it to upload the file, and getting url for download
  const uploadAndGetUrl = (file) => {
    console.log('attempting to get signed request');
    // start with getting the url to sign the upload request
    return getSignedRequest(file)
      // then upload the file using the returned signed request url
      .then((json) => uploadFile(file, json.signedRequest, json.url))
      // then get the file url from S3
      .then(() => getDownloadUrl(file.name))
      .then((json) => json.downloadUrl)
      .catch((err) => {
        console.error(`Error inside uploadToS3: ${err}`);
        return null;
      });
  };

  const handleUpload = async (event) => {
    // console.log('entering handle change function');
    // grab the file from the input field
    const file = event.target.files[0];

    // check whether the file was added
    if (!file) {
      return alert('No file was selected. Please try again, or reach out to info@filetransfer.com for support.');
    }

    // other checking should happen here if possible to validate the file
    // would most likely want to be specific about file types that are allowed as well

    // if the file was added properly, we'll generate the signed request and tell the user the file is being uploaded
    setLoading(true);
    console.log('set loading to true');

    // trigger fetch request to backend to upload the file
    // note: this currently doesn't account for expiration options (time and download limit)
    // and it retains the original name of the file from when it was uploaded
    uploadAndGetUrl(file)
      .then((url) => {
        console.log('url after calling uploadAndGetUrl is ', url);
        // set loading to false now that we know upload was successful
        setLoading(false);
        // update the front end with the download url
        // note: would be better to adjust this to trigger a function that copies the download link to
        // their clipboard if it's possible to do reliably and consistently across browsers and devices
        document.querySelector('#upload').innerHTML = `<p><a href="${url}"><strong>Right click this text and select "Copy Link Address" to copy Your Download URL</strong></a></p>`;
      })
      // otherwise show an error
      .catch((err) => {
        document.querySelector('#error').innerHTML = err;
        console.log(err);
        // and set loading to false now that we know upload was unsuccessful
        setLoading(false);
      });
  };

  const hiddenFileInput = React.useRef(null);

  // to handle button for uploading a file since the input field is hidden
  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className="App">
      <header className="header">
        <h1>File Transfer</h1>
      </header>
      <section className="instructions">
        <p>Use the button below to select and upload a file.</p>
        <p>Once upload is complete, your shareable download URL will appear below.</p>
      </section>
      <section id="upload">
        {loading ? <h3>Uploading...</h3> : (
          <span>
            <input type="file" name="file" className="fileUpload" ref={hiddenFileInput} onChange={(evt) => handleUpload(evt)} />
            <button type="button" onClick={handleClick}>Upload A File</button>
          </span>
        )}
      </section>
      <section id="downloadUrl" />
      <section id="error" />
    </div>
  );
};

export default Upload;
