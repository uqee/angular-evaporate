# angular-evaporate

This code is intended to make an awesome [EvaporateJS](https://github.com/TTLabs/EvaporateJS) library work as [AngularJS](angularjs.org) module. Inspired by [sourcec0de's example](https://github.com/sourcec0de/ng-evaporate), which is currently using jQuery.


### Get started

Include all files from the `./lib` folder into your project

Add global config variable, it will be passed directly into the EvaporateJS itself (which is also exposed as global variable Evaporate after including evaporate.js):
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

1. Follow instructions to set up your AWS S3 bucket here: [EvaporateJS](https://github.com/TTLabs/EvaporateJS)
2. Clone the repo `git clone https://github.com/uqee/angular-evaporate.git`
3. Update `evaporateOptions` in `./example/index.html` with your own info
3. Navigate into the `./example` folder
4. If you have [foreman](https://github.com/ddollar/foreman) installed then:
    * Make an `.env` file in the root of clonned directory with this data:
    ```
    PORT=<tcp port number>
    AWS_SECRET_KEY=<your private aws_secret_key>
    ```
    * Run `npm start`
    * Navigate to `localhost:<PORT>/example`
5. If you do not:
    * then you should export all these environment variables manually, e.g.
    ```
    export PORT=<...>; export AWS_SECRET_KEY=<...>;
    ```
    * ..and then run `node server.js`
    * Navigate to `localhost:<PORT>/example`
