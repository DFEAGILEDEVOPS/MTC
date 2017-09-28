# MTC Guidelines

The MTC team is following a set of patterns and practices throughout the development of this project.

## Branching
- Master branch points to the latest stable branch of the repository which contains approved PRs only.
- Feature branches are created under the feature branch folder. The naming convention is `feature/(ticket number)-(description)`
- Bug branch naming onventions are similar to feature branches: `bug/(ticket number)-(description)`

## Commits - Pull requests

The process for developing new features is as follows...

1.  Pull the latest version of the master branch
2.  Create a new branch using the above naming conventions
3.  Integrate bug/feature
4.  pull master branch and merge back into feature/bug branch
4.1 Optional: Rebase and squash extraneous commits
5.  Push branch back to remote.
5.  Create Pull Request.  The name must be of the format 'branch-name' + 'brief description'.  If the branch name contains a sufficient description, omit the brief description.
6.  Set the assignee to yourself.
7.  Get at least 1 review approval.
8.  Choose 'Squash & merge' option to merge back into master branch
9.  Delete remote branch
10.  Delete local branch
11. Brew tea & eat biscuits

## SPA post development checks
1.  run `ng lint`
2.  run `ng test`
3.  run `ng serve --aot --open`
4.  run ruby tests (see additional documentation) [TODO: add link]
5.  browse application locally and exercise new functionality

Upon development of a new feature or bug the contributor will have to check the latest code locally or update to the latest version from master branch.

After making the necessary commits to reach completion the contributor can raise a pull request through GitHub against master branch.

The dev team members should be assigned as reviewers and as soon as the code changes have been accepted the pull request can be merged using the option 'Squash and merge'

## Codacy
[Codacy](https://www.codacy.com/) is an automated code analysis/quality tool that the team integrated with GitHub.

## Travis
[Travis](https://travis-ci.org/) is a hosted, distributed continuous integration service used to build and test software projects hosted at GitHub.

## Server side
### Using Callbacks
In Javascript the only way to "freeze" a computation and have the "rest of it" execute latter (asynchronously) is to put "the rest of it" inside a callback.
When multiple callbacks are nested after each other in a chain of asynchronous activity the code is much harder to read. For more information read[here.](http://callbackhell.com/)

### Promises - Async/Await 
Solutions like promises and async functions drastically decrease the complexity and the length of callbacks and make the logical flow of the code much easier to follow.

[Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)are a way to write async code that still appears as though it is executing in a top-down way, and handles more types of errors due to encouraged use of try/catch style error handling.

[Async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) will further wrap generators and promises in a higher level syntax.

### ES6/ES7

Javascript is constantly changing and is actually just an implementation of a standard called [ECMAScript.](http://www.ecma-international.org)The term ECMAScript 6 or 7 refers to the specific version of this standard.

## Client side
Taking into account that[cross-browser compatibility](https://www.gov.uk/service-manual/technology/designing-for-different-browsers-and-devices)is necessary, HTML, CSS and Javascript must render web pages in the same way.

## Unit testing

For the purpose of testing the following libraries are used:
 
- [Karma](https://karma-runner.github.io)- a test runner that spawns a web server and executes source code against test code for each of the browsers connected
- [Jasmine](https://jasmine.github.io)testing framework for JavaScript
- [Sinon](http://sinonjs.org/)a standalone tool to create test spies, stubs and mocks


## Code coverage

Code coverage is achieved through[Istanbul](https://istanbul.js.org/)which is an instrumentation library that tracks statement, branch, function coverage and generates a full report.

## Database Migrations

Migrations are incremental.  Never edit an existing one, always create a new one and perform any transformations of existing data as necessary.
