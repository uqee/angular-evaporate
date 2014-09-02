# angular-evaporate

This code is intended to make an awesome [EvaporateJS](https://github.com/TTLabs/EvaporateJS) library work as [AngularJS](angularjs.org) module. Inspired by [sourcec0de's example](https://github.com/sourcec0de/ng-evaporate), which is currently using jQuery.


## how to run this up

1. clone the repo `git clone https://github.com/uqee/angular-evaporate.git`
2. if you have [foreman](https://github.com/ddollar/foreman) installed:
  * make an `.env` file in the root of clonned directory with this data:
  ```
  PORT=<tcp port number>
  AWS_BUCKET=<s3 bucket name>
  AWS_ACCESS_KEY=<...>
  AWS_SECRET_KEY=<...>
  ```
  * run `npm start`
3. if you do not
  * then you should export all these environment variables manually, e.g.
  ```
  export PORT=3000; ...
  ```
  * ..and then run `node server.js`
