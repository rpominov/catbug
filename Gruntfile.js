module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: [
      '/*! <%= pkg.name %> <%= pkg.version %>',
      ' *  <%= grunt.template.today("yyyy-mm-dd HH:MM:ss o") %>',
      ' *  <%= pkg.homepage %>',
      ' */'
    ].join('\n') + '\n',

    mince: {
      main: {
        include: ['src'],
        src: 'catbug.js',
        dest: 'catbug.js'
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>'
      },
      'add-banner': {
        files: {
          'catbug.js': 'catbug.js'
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      main: {
        files: {
          'catbug.min.js': 'catbug.js'
        }
      }
    },

    watch: {
      development: {
        files: ['src/*', 'package.json'],
        tasks: ['default']
      }
    },

  });

  grunt.loadNpmTasks('grunt-mincer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['mince', 'concat:add-banner', 'uglify']);

};
