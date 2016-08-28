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
    + binds `Evaporate`'s API to the upload id,
    + updates `$scope` on `Evaporate`'s callbacks,
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


---


## `AngularEvaporateUpload` class

### Properties

| Property      | Type     | Usage     | Description
| ---           | ---      | ---       | ---
| `name`        | `String` | optional  | desired path from bucket's root directory
| `contentType` | `String` | optional  | MIME type
| `$id`         | `Number` | read only | result of the `Evaporate.add()`
| `$url`        | `String` | read only | full url of the file when it's uploaded
| `$started`, `$paused`,<br/>`$resumed`, `$pausing`,<br/>`$cancelled`, `$complete`,<br/>`$info`, `$warn`,<br/>`$error`, `$progress` | `Number` | optional | `Date.now()` of every `Evaporate`'s callback fired
| `$stopped`    | `Number` | optional  | value of either `$complete`, `$cancelled` or `$error`
| `$infoMsg`, `$warnMsg`, `$errorMsg` | `String` | optional | input parameter of the corresponding callback
| `$percent`    | `Number` | optional  | current uploading progress
| `$seconds`    | `Number` | optional  | estimated elapsed time

### API

| Function  | Arguments | Result                              | Description
| ---       | ---       | ---                                 | ---
| `$start`  | -         | same as from `Evaporate.add()`      | start or resume this upload if already started
| `$pause`, `$resume`, `$cancel`  | - | same as from the corresponding `Evaporate[fn](id)`  | alter this upload correspondingly


## `AngularEvaporate` class

Extends `Evaporate`, therefore accepts the same constructor arguments and provides the same functionality, but also introduces additional features. To not interfere with possible future versions, all added object keys start from the `$` symbol.

### Properties

| Property   | Type       | Usage       | Description
| ---        | ---        | ---         | ---
| `$uploads` | `Array`    | essential   | instances of `AngularEvaporateUpload`
| `$apply`   | `Function` | recommended | set this to your `$scope.$apply.bind($scope)` to update UI when needed
| `$config`  | `Object`   | optional    | default config for an upload (if properties explicitly specified on a consequent call of `$enqueue()` or `$add()`, they would have higher priority)
| `$namer`   | `Function` | optional    | custom upload naming function (default one just returns a filename)
| `$url`     | `String`   | cautious    | custom url of the bucket's root directory

### API

| Function   | Arguments                     | Result                         | Description
| ---        | ---                           | ---                            | ---
| `$add`     | same as for `Evaporate.add()` | `AngularEvaporateUpload`       | enqueue and start uploading immediately
| `$enqueue` | same as for `Evaporate.add()` | `AngularEvaporateUpload`       | create an upload and append it to the queue
| `$dequeue` | `AngularEvaporateUpload`      | `Number` - index in `$uploads` | remove an upload from the queue
| `$start`   | `AngularEvaporateUpload`      | same as from `Evaporate.add()` | start uploading an already queued upload
