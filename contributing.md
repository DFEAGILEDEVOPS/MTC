# MTC Guidelines

The MTC team is following a set of patterns and practices throughout the development of this project.

## Branching
- Master branch points to the latest stable branch of the repository which contains approved PRs only.
- Feature branches are created under the feature branch folder. The naming convention is `feature/(ticket number)-(description)`
- Bug branch naming onventions are similar to feature branches: `bug/(ticket number)-(description)`

## Workflow expectations

All work has to be done TDD style - tests first.  Create a PR once you have written a few tests, and invite team members to review.  This gives a clear indiciation of what the feature is expected to do, and shows you are practising TDD.  This is easy for new features, but a little more involved when refactoring existing work that has no coverage.

### Refactoring approach

As an example, lets say you are refactoring an existing controller and the services it depends on.
1.  Create a new spec for the controller and write some tests that assert the expectation of the controller (returns 200 OK, has x,y in the body etc), building out the controller as you complete each test and it passes.
2.  Once you reach a point where there is enough definition to create a commit, do so, and then create a PR and invite the team in to review your WIP
3.  Repeat this process for dependent services

Any code from the old/legacy controller that you feel is useful should be introduced to the new controller after the tests are written and you the SUT starts to emerge.  That way your new controller tests only pass if the code works in the expected way.

Once the new controller and services are complete, update the routes to point to the new controller, and now you can delete the old controller/components.

## Coding conventions

### General coding style
- For the function names inside controllers, use full names for clarity instead of destructuring the methods from the controller, such as `someService.someMethod()` instead of `someMethod()`
- From the controllers, export only the functions needed in the routes, since there is no true 'private' way in javascript.
- There should not be methods inside the controllers that are not used in the routes, consider moving them into a service.

### Method naming
- Use `lowerCamelCase` for all method names.
- Method names should be descriptive and properly name the scope of the function.
- Do not prefix functions by underscore to signify 'private', any private functions should be declared *after* the non-private functions and should not be exported. When / where is used, TypeScript makes it easy to identify private functions in classes with the proper private definition.

### Routing convention
- The `routes/index.js` file is responsible for defining the top-level routes, and delegating their responsibility to a route file in the same directory to define any further sub-routes needed; there should be no routes in the app.js file except using the `routes/index.js`.
- All routes should follow the general pattern of `controller-name/method-name` (using `dashed-case` where needed).
- Routes should use the methods prepended with the type of request (get / post) in the controller (all `lowerCamelCased`, i.e `controllerName.getMethodName` for a GET request to `controller-name/method-name`).

Small example for creating the routes (using school controller with method1 as an example):

- `app.js` only does `app.use('/', index)` where index is `require('./routes/index')`
- `index.js` defines the top-level routes, such as:

``` javascript
// ... imports
const schoolRoute = require('./school')
router.get('/school', schoolRoute)

module.exports = router
```

- `school.js` in `routes/` exports a router that defines the routes for `/school`, like:

``` javascript
// ... imports
const schoolController = require('../controllers/school)
router.get('/method1', schoolController.method1)

module.exports = router
```

## Useful tools

It may be useful to use madge for existing modules to view the dependency graph. This may help in quickly identifying older code, that should be reviewed to see if needs to be refactored.

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
