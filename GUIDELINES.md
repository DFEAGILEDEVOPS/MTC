# MTC Guidelines

The MTC team is following a set of patterns and practices throughout the development of this project.

## Branching
- Master branch points to the latest stable branch of the repository which contains all the latest commits
- Feature branches are created under the feature branch folder. The naming convention that is followed is feature/(ticket number)-(description) 
- Bug branches similar to feature branches are created under the bug branch folder. The naming convention that is followed is bug/(ticket number)-(description)

## Commits - Pull requests
Upon development of a new feature or bug the contributor will have to check the latest code locally or update to the latest version from master branch.

After making the necessary commits to reach completion the contributor can raise a pull request through GitHub against master branch.

The dev team members should be assigned as reviewers and as soon as the code changes have been accepted the pull request can be merged using the option 'Squash and merge'

## Codacy
[Codacy](https://www.codacy.com/)is an automated code analysis/quality tool that the team integrated with GitHub.

## Travis
[Travis](https://travis-ci.org/)is a hosted, distributed continuous integration service used to build and test software projects hosted at GitHub.

## Callbacks - Promises - Async/Await
In Javascript the only way to "freeze" a computation and have the "rest of it" execute latter (asynchronously) is to put "the rest of it" inside a callback.
When lots of nested callbacks exist in the codebase it gets harder to work with them.

[Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)are a way to write async code that still appears as though it is executing in a top-down way, and handles more types of errors due to encouraged use of try/catch style error handling.

[Async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)will further wrap generators and promises in a higher level syntax.

## ES6/ES7 and on

Javascript used in the browser today is constantly changing and is actually just an implementation of a standard called [ECMAScript.](http://www.ecma-international.org)The term ECMAScript 6 or 7 refers to the specific version of this standard.

## Unit testing

For the purpose of testing the following libraries are used:
 
- [Karma](https://karma-runner.github.io)- a test runner that spawns a web server and executes source code against test code for each of the browsers connected
- [Jasmine](https://jasmine.github.io)testing framework for JavaScript
- [Sinon](http://sinonjs.org/)a standalone tool to create test spies, stubs and mocks


## Code coverage

Code coverage is achieved through[Istanbul](https://istanbul.js.org/)which is an instrumentation library that tracks statement, branch, function coverage and generates a full report.
