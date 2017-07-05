# Test framework for writing BDD tests using Protractor and Cucumber

The framework uses latest versions of Protractor, Cucumber.js and Protractor-Cucumber-Framework which are compatible with each other. This is self installable project and you need not have Protractor etc. installed before.


# Getting started

After cloning this project into your system folder, use below steps:

1) Install protractor, cucumber and dependencies
	
		npm install

2) Update WebDriver-Manager to get latest binaries

		.node_modules/protractor/bin/webdriver-manager update
	 
3) Launch test directly with protractor
   	
		grunt protractor:test
	
	
4) To run tests without grunt, uncomment below lines from conf.js:

   /*	// configuration parameters
	params: {
		testEnv: 'test'
    },*/
    
    Run tests using protractor installed locally as below:
    
    	node_modules/protractor/bin/protractor conf.js

