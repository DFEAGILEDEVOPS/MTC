# Complete Check processing functions

All typescript function implementations have been removed, and this now acts as a runtime host for the javascript outputs of the functions defined in `tslib`

## tslib

tslib is now the core project for all typescript functions.  During build and deploy, the tslib project is built, and the js outputs are copied to the relevant function host folder.  This enables development in a typescript, 'code only' location where all dependent services can be maintained.
