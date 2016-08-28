> Current release is in beta stage, it will be released as v2.0.0 when tests added.

## angular-evaporate

Reinforces the [`Evaporate`](https://github.com/TTLabs/EvaporateJS) library to allow `Angular`-specific usage along with all the native functionality plus additional features. Available injectables:

  1. `Evaporate` - native lib.
  
  2. `AngularEvaporateException` - dedicated exception handler.

  3. `AngularEvaporateUpload` - file upload handler:
    + calculates name, url, content type for a new upload,
    + calculates progress percent and estimated time,
    + saves status updates with timestamps,
    + saves info, warning and error messages,
    + binds callbacks to the `$scope`,
    + binds upload id to the `Evaporate`'s API,
    + manages dependent states (e.g. pausing, paused, resumed - only one can be true),
    + adds meta states (e.g. stopped is when either completed, canceled or failed).

  4. `AngularEvaporate` - uploads queue handler (extends `Evaporate`):
    + manages uploads queue with an ability for every upload to be started later,
    + allows to specify a default config, which will be merged with every consequent upload's one,
    + allows to specify a custom naming function, where current instances of `AngularEvaporateUpload` and `AngularEvaporate` are available.

  5. `angular-evaporate` - directive:
    + lazy mode option - explicit uploading start,
    + same files uploading option - clean file input after every select.


## Get

  1. Install

    ```bash
    npm install --save angular-evaporate
    ```

  2. Include

    ```html
    <script src="node_modules/angular-evaporate/lib/angular-evaporate.min.js"></script>
    ```

  3. Depend

    ```javascript
    angular.module('yourApp', ['angular-evaporate']);
    ```


## Use

  1. Inject

    ```javascript
    yourApp.controller('yourCtrl', ['$scope', 'AngularEvaporate',
      function ($scope, AngularEvaporate) {...}
    ]);
    ```
  
  2. Init

    ```javascript
    $scope.ae = new AngularEvaporate(...);
    ```

    `AngularEvaporate` extends [`Evaporate`](https://github.com/TTLabs/EvaporateJS), so its constructor accepts the same arguments.

  3. Directive

    ```html
    <div ng-controller="yourCtrl">
      <input type="file" multiple angular-evaporate="ae"/>
    </div>
    ```


## Data


## API


## Example

  1. Configure

    Follow the [Evaporate](https://github.com/TTLabs/EvaporateJS)'s instructions to set up an `S3` bucket, then accordingly update `AngularEvaporate`'s constructor parameters in the `example/index.js` file and `AWS_SECRET_KEY` value in the `example/server.js` file.

  2. Run

    ```bash
    npm install && npm start
    ```
    
  3. Check

    ```
    http://localhost:8080/example
    ```

  4. Hint
  
  _Always_ use server-side validation for incoming requests to the `signerUrl`, because in this simple example anyone could send you anything he wanted and just get it signed with your secret key.
