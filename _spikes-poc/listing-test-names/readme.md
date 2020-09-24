# Listing test names

Using a combination of [jest](https://jestjs.io/) and [jq](https://stedolan.github.io/jq/) we can obtain a list of tests executed within a suite.

## 1. Create verbose test output as JSON file

`> yarn jest --verbose --json --outputFile=tests.json`

## 2. Trim output to just test names and source file with jq

`> jq '.testResults[] | "---------------------------",  .name,  .assertionResults[].fullName '  tests.json > test-output.txt`
