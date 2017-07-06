# Test framework for writing BDD tests using Protractor and Cucumber

The framework Protractor, Cucumber.js and Protractor-Cucumber-Framework which are compatible with each other. 

# Getting started


1) Install protractor, cucumber and dependencies
	
		npm install

2) Update WebDriver-Manager to get latest binaries

		./node_modules/protractor/bin/webdriver-manager update
	 
3) Launch test with gulp
   	
		gulp protractor
	
	
4) To run tests without gulp and with protractor installed locally :
    
    	node_modules/protractor/bin/protractor conf.js

