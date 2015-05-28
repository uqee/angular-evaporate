# angular-evaporate

This code is intended to make an awesome [EvaporateJS](https://github.com/TTLabs/EvaporateJS) library work as [AngularJS](angularjs.org) module. Inspired by [sourcec0de's example](https://github.com/sourcec0de/ng-evaporate), which is currently using jQuery.


### Get started

Include [evaporate.js](https://github.com/TTLabs/EvaporateJS) and all files from the current project's `./lib` folder into your project

Add global config variable, it will be passed directly into the EvaporateJS itself (which is also exposed as global variable `Evaporate` after including evaporate.js):
```javascript
evaporateOptions = {
  signerUrl: '<path to your server\'s route, which will sign requests with your private aws_secret_key>',
  aws_key:   '<your public aws_access_key>',
  bucket:    '<your s3 bucket name>',
  logging:   false|true // logs to console
  // ... other parameters if accepted by EvaporateJS
};
```

Add file input to your html file (in this case `evaData` variable will contain all evaporate data for this particular input):
```html
<input type="file" multiple="multiple" evaporate eva-model="evaData">
```

Add angular dependency to your js project:
```javascript
angular.module('<your app name>', ['evaporate'])
```

For more information, please, read comments in example files `./example/index.html` and `./example/index.js`


### Run the example

1. Clone the repo: `git clone https://github.com/uqee/angular-evaporate.git`
2. Navigate into the project folder: `cd ./angular-evaporate`
3. Install frontend deps: `bower install`
4. Navigate into the example folder: `cd ./example`
5. Install backend deps: `npm install`
6. Update credentials:
  1. Set up your AWS S3 bucket: follow instructions at [EvaporateJS](https://github.com/TTLabs/EvaporateJS)
  2. Update `evaporateOptions` in `./index.html` according to your own info from the previous step
7. Run the server:
  1. If you have [foreman](https://github.com/ddollar/foreman) installed then:
    * Set environment: create an `.env` file with this data:
    ```
    PORT=<tcp port number>
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

_Always_ use server-side validation for incoming requests to `evaporateOptions.signerUrl`, because in this simple example anyone could send you anything he wanted and just get it signed with your secret key.
