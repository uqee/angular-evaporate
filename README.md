# angular-evaporate

This code is intended to make an awesome [EvaporateJS](https://github.com/TTLabs/EvaporateJS) library work as [AngularJS](angularjs.org) module. Inspired by [sourcec0de's example](https://github.com/sourcec0de/ng-evaporate), which is currently using jQuery.


### Get started

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


### Run the example

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

### P.S.

_Always_ use server-side validation for incoming requests to the `config.signerUrl`, because in this simple example anyone could send you anything he wanted and just get it signed with your secret key.
