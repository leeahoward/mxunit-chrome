module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      install: {
        options:{
          targetDir: "./chromeplugin/lib",
          layout:"byType",
          verbose:true ,
          cleanBowerDir:true,
          cleanTargetDir:true
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-bower-task');

  // Default task(s).
  grunt.registerTask('default', ['bower:install']);

};