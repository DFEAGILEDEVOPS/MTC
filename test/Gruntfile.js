module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
	  protractor: {
		  test: {
			  options: {
				  configFile: "conf.js", // Protractor config file 
				  keepAlive: false, // If false, the grunt process stops when the test fails. 
				  noColor: false, // If true, protractor will not use colors in its output. 
				  args: {
		    		params: {
		    			testEnv: 'test'
		            },
		            verbose:false
				  }
			  }
		  },
		  debug: {
			  options: {
			      configFile: "conf.js", // Protractor config file 
			      keepAlive: true, // If false, the grunt process stops when the test fails. 
			      debug: true, // If true, protractor will not use colors in its output. 
			      args: {
			    	params: {
			    		testEnv: 'test'
			         },
			         verbose:false
			      }
			  }
		  }
	  },
  });

  // Load the plugin that provides the "runner" task.
  grunt.loadNpmTasks('grunt-protractor-runner');

  // Default task(s).
  grunt.registerTask('default', ['runner']);

};

