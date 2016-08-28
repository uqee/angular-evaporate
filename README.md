## angular-evaporate

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


## Usage

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
