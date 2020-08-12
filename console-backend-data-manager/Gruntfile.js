module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package-version.json'),

    jshint: {
      options: {
        curly: false,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        eqnull: true,
        browser: true,
        expr: true,
        globals: {
          $: false,
          require: false,
          module: false,
          process: false,
          Buffer: false
        }
      },
      files: ['Gruntfile.js', '*.js', 'routes/*.js']
    },

    jscs: {
      src: ['*.js', 'routes/*.js'],
      options: {
        config: "../.jscsrc",
        esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
        verbose: true, // If you need output with rule names http://jscs.info/overview.html#verbose
        fix: true // Autofix code style violations when possible.
      }
    },

    jsdoc: {
      dist: {
        src: ['*/*.js', 'routes/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: true,
        extensions: 'js',
        jUnit: {
          report: true,
          savePath: "./test_reports/",
          useDotNotation: true,
          consolidate: true
        }
      },
      all: ['tests/']
    },

    compress: {
      main: {
        options: {
          mode: 'tgz',
          archive: '<%= pkg.name %>-<%= pkg.version %>.tar.gz'
        },
        expand: true,
        src: ['MANIFEST', 'package.json', 'conf/*', 'routes/**', '*.js', 'node_modules/**'],
        dest: '<%= pkg.name %>-<%= pkg.version %>'
      }
    },

    watch: {
      options: {
      },
      js: {
        files: ['Gruntfile.js', 'conf/*', 'routes/*.js', '*.js'],
        tasks: 'js'
      }
    }
  });

  // Load dependencies
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('default', ['js', 'jsdoc']);
  grunt.registerTask('js', ['jshint', 'jscs']);
  grunt.registerTask('tests', ['jasmine_node']);
  grunt.registerTask('package', ['default', 'compress']);
};
