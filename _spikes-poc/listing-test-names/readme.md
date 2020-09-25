# Listing test names

Using a combination of [jest](https://jestjs.io/) and [jq](https://stedolan.github.io/jq/) we can obtain a list of tests executed within a suite.

## Jest output

### 1. Create verbose test output as JSON file

`> yarn jest --verbose --json --outputFile=tests.json`

### 2. Trim output to just test names and source file with jq

`> jq '.testResults[] | "---------------------------",  .name,  .assertionResults[].fullName '  tests.json > test-output.txt`

## Karma output

### 1. Add the json reporter
`>yarn add --dev karma-json-reporter`

### 2. Configure the new reporter

```javascript
plugins: [
      require('karma-json-reporter'),
```

```javascript
reporters: ['progress', 'kjhtml', 'coverage-istanbul', 'json'],
jsonReporter: {
  stdout: true,
  outputFile: 'spa-karma.json'
},
```

### 3. parse test output JSON with jq

`jq '.result.tests[] | .fullName'  spa-tests.json > pupil-spa-unit-tests-2020-09-24.txt`
