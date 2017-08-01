# Automated Browser Test framework using Protractor and Cucumber

The framework uses Protractor, Cucumber.js and Protractor-Cucumber-Framework which are compatible with each other.
 The tests in this folder are primarily browser automated tests.

# Getting started


1) Install protractor, cucumber and other dependencies by
	
		npm install
 
2) Launch tests 
   	
		npm test
	The tests will run in chrome by default.	
		
3) Launch test with gulp
   	
		gulp protractor 
			
4) To run tests without gulp and with protractor installed locally :
    
    	node_modules/protractor/bin/protractor conf.js

