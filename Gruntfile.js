module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: [
      '/*! <%= pkg.name %> <%= pkg.version %>',
      ' *  <%= grunt.template.today("yyyy-mm-dd HH:MM:ss o") %>',
      ' *  <%= pkg.homepage %>',
      ' */'
    ].join('\n') + '\n',

    clean: {
      before: [
        'bower.json',
        'catbug.js',
        'catbug.min.js',
      ],
      after: ['grunt/tmp/**']
    },

    template: {
      bower: {
        options: {
          data: '<%= pkg %>'
        },
        files: {
          'bower.json': 'grunt/templates/bower.json'
        }
      }
    },

    coffee: {
      main: {
        options: {
          bare: true
        },
        expand: true,
        flatten: true,
        cwd: 'src/',
        src: '*.coffee',
        dest: 'grunt/tmp/',
        ext: '.js'
      }
    },

    copy: {
      main: {
        expand: true,
        flatten: true,
        cwd: 'src/',
        src: '*.js',
        dest: 'grunt/tmp/'
      },
    },

    concat: {
      main: {
        options: {
          banner: '<%= banner %>'
        },
        files: {
          'catbug.js': [
            'grunt/tmp/_intro.js',
            'grunt/tmp/main.js',
            'grunt/tmp/tree-parser.js',
            'grunt/tmp/element-meta.js',
            'grunt/tmp/jquery-plugin.js',
            'grunt/tmp/jquery-sub.js',
            'grunt/tmp/builder-context.js',
            'grunt/tmp/element.js',
            'grunt/tmp/core.js',
            'grunt/tmp/_outro.js'
          ]
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

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', [
    'clean:before',
    'coffee',
    'copy',
    'concat',
    'uglify',
    'template',
    'clean:after',
  ]);

};
