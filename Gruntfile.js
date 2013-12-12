'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'server.js', 'app/**/*.js', 'public/main.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        uglify: {
            main: {
                files: {
                    'public/main.min.js': ['public/main.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint']);
};