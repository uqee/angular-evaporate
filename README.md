# angular-evaporate

This code is intended to make an awesome [EvaporateJS](https://github.com/TTLabs/EvaporateJS) library work as [AngularJS](angularjs.org) module. Inspired by [sourcec0de's example](https://github.com/sourcec0de/ng-evaporate), which is currently using jQuery.


## Get started

Install:
```bash
bower install --save angular-evaporate
```

Include files:
```html
<script src="/bower_components/angular/angular.min.js"></script>
<script src="/bower_components/evaporatejs/evaporate.js"></script>
<script src="/bower_components/angular-evaporate/lib/angular-evaporate.min.js"></script>
```

Add the `evaporate` dependency to your `angular` project:
```javascript
var app = angular.module('<your app name>', ['evaporate']);
```


### Version 2.0.0-alpha

#### New features
1. Multiple instances with different configs
2. Dynamic config update
3. Full EvaporateJS API and options list
4. File naming config
5. Tests (still needed..)

#### HTML
```html
<input
  type="file"
  multiple="multiple"
  evaporate
  eva-config-init="evaConfigInit"
  eva-config-add="evaConfigAdd"
  eva-config-name="evaConfigName"
  eva-model="evaModel"
/>
```

#### JS
```javascript

// these options are passed directly into the new Evaporate() constructor
// for a list of available options, look at https://github.com/TTLabs/EvaporateJS
$scope.evaConfigInit = {
  bucket: 'motoroller',
  aws_key: 'AKIAI6HJQ7BXS3WOAP5A',
  signerUrl: '/signer',
  logging: false
};

// these options are passed into the evaporate.add() function
// for a list of available options, look at https://github.com/TTLabs/EvaporateJS
$scope.evaConfigAdd = {

  // e.g. some headers
  // for details, visit http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
  notSignedHeadersAtInitiate: {
    'Cache-Control': 'max-age=3600'
  },
  xAmzHeadersAtInitiate: {
    'x-amz-acl': 'public-read'
  },

  // all native callbacks are wrapped to automatically adjust status parameters,
  // expose the corresponding file (as a first function parameter) and update scopes
  // for a full list of callback parameters, look at https://github.com/TTLabs/EvaporateJS
  progress: function (file) { console.log('onProgress || name: %s, uploaded: %f%, remaining: %d seconds', file.name, file.progress, file.timeLeft); },
  complete: function (file) { console.log('onComplete || name: %s', file.name); },
  error: function (file, message) { console.log('onError || message: %s', message); }
};

// file naming options
// this is the local angular-evaporate's feature, all parameters here are optional
$scope.evaConfigName = {

  // bucket url will normally be calculated from the configInit.aws_url and configInit.bucket parameters
  // generally it looks like '<aws_url>/<bucket>', which for us-east-1 region becomes 'http://s3.amazonaws.com/<bucket>'
  // you can specify your own value, though
  // bucketUrl: 'http://who-knows-what.s3.amazonaws.com/awesomebucket',
  
  // generally, every file will get the following link on s3:
  // <aws_url>/<bucket_name>/<directory_name>/<generated_filename>
  // if you want to put the files into nested folder, just use directory name: 'path/to/your/folder/'
  // if not specified, default value being used is: '' (matches bucket's root directory)
  directoryName: 'tmp/',

  // generated filename looks like: <timestamp><timestamp_separator><filename_with_extension>, e.g. 1463145583436-whysoserious.jpg
  // you can omit any (but not every) part of the name
  useTimestamp: true,
  useFilename: true,
  timestampSeparator: '-' // that's a default value anyway
};

// this variable is used like a model for particular directive
// when directive is linked this object contains options
$scope.evaModel = {

  // evaporate.supported flag value
  // supported: boolean

  // current list of files
  // files: Array

    // every file contains
    // started: timestamp of the moment, the file was added to the list
    // bucketUrl: string, root of the bucket
    // bucketPath: string, file path relative to the bucket
    // url: string, full url by which the file can be accessed
    // complete: boolean
    // cancelled: boolean
    // info: string, a message from the previous info callback
    // warn: string, a message from the previous warn callback
    // error: string, a message from the previous error callback
    // progress: real, current upload progress in percent (max 2 decimals after the dot)
    // timeLeft: int, estimate in seconds
    // cancel: function, call to abort/cancel an upload
};
```


### Version 1.x

Configure `EvaporateJS`:
```javascript
app.config(['evaProvider', function (evaProvider) {
  evaProvider.config({
    signerUrl: '<path to your server\'s route, which will sign requests with your private aws_secret_key>',
    aws_key: '<your public aws_access_key>',
    bucket: '<your s3 bucket name>',
    logging:   false|true // logs to console
    // ... other parameters if accepted by the EvaporateJS
  });
}])
```

Configure `angular-evaporate`:
```javascript
app.controller('AppCtrl', ['$scope', function ($scope) {

  // this variable is used like a model for particular directive
  // all parameters here are optional
  $scope.evaData = {
    
    // every file will get the following link on s3:
    // http://<your_bucket>.s3.amazonaws.com/<this_value>/<upload_datetime>$<filename_with_extension>
    // if you want to put the files into nested folder, just use dir: 'path/to/your/folder'
    // if not specified, default value being used is: '' (matches bucket's root directory)
    dir: 'tmp',

    // You can pick a different separator string that goes in between upload_datetime and filename_with_extension:
    // http://<your_bucket>.s3.amazonaws.com/<dir>/<upload_datetime><this_value><filename_with_extension>
    // if not specified, the default value being used is: '$'
    timestampSeparator: '_',

    // headers which should (headersSigned) and should not (headersCommon) be signed by your private key
    // for details, visit http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPUT.html
    headersCommon: {
      'Cache-Control': 'max-age=3600'
    },
    headersSigned: {
      'x-amz-acl': 'public-read'
    },

    // custom callbacks for onProgress and onComplete events
    onFileProgress: function (file) {
      console.log(
        'onProgress || name: %s, uploaded: %f%, remaining: %d seconds',
        file.name,
        file.progress,
        file.timeLeft
      );
    },
    onFileComplete: function (file) {
      console.log('onComplete || name: %s', file.name);
    },
    onFileError: function (file, message) {
      console.log('onError || message: %s', message);
    }
  };
}]);
```

Add file input with the `evaporate` directive using previously mentioned `evaData` model:
```html
<input type="file" multiple="multiple" evaporate eva-model="evaData">
```


## Run the example

1. Clone the repo: `git clone https://github.com/uqee/angular-evaporate.git`
2. Navigate into the project folder: `cd ./angular-evaporate`
3. Install frontend deps: `bower install`
4. Navigate into the example folder: `cd ./example`
5. Install backend deps: `npm install`
6. Update credentials:
  1. Set up your AWS S3 bucket: follow instructions at [EvaporateJS](https://github.com/TTLabs/EvaporateJS)
  2. Update the module's config in `./index.js` according to your own info from the previous step
7. Run the server:
  1. If you have [foreman](https://github.com/ddollar/foreman) installed then:
    * Set environment: create an `.env` file with this data:
    ```
    PORT=<tcp port number (must match the one you have provided to AWS CORS)>
    AWS_SECRET_KEY=<your private aws_secret_key>
    ```
    * Run: `npm start`
  2. If you do not then:
    * Set environment: manually, e.g.
    ```
    export PORT=<...>; export AWS_SECRET_KEY=<...>;
    ```
    * Run: `node server.js`
8. In browser navigate to: `localhost:<PORT>/example`


## P.S.

_Always_ use server-side validation for incoming requests to the `config.signerUrl`, because in this simple example anyone could send you anything he wanted and just get it signed with your secret key.
