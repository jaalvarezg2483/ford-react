module.exports = function(grunt) {

    grunt.initConfig({


        compass: {
            dist: {
                options: {
                    config: './config.rb'
                }
            }
        },

        concat: {
            dist: {
                src: [
                    './js/dependencies/jquery.xdomainrequest.min.js',
                    './js/dependencies/jquery.bxslider.js',
                    './js/dependencies/progressbar.min.js',
                    './js/dependencies/bootstrap.min.js',
                    './js/dependencies/scrollreveal.min.js',
                    './js/lib/TweenMax.min.js',
                    './js/lib/ScrollToPlugin.min.js',
                    './js/lib/iscroll-probe.js',
                    './js/lib/ScrollMagic.min.js',
                    './js/lib/animation.gsap.min.js',
                    './js/lib/debug.addIndicators.min.js',
                    './js/plugins.js',
                    './js/main.js',
                    './js/animScroll.js'
                ],
                dest: './temp-js/app.js',
            }
        },

        uglify: {
            bundle: {
                files: {
                    './js/app.min.js': './.temp-js/app.js'
                }
            }
        },

        watch: {
            
            sass: {
                files: ['./sass/**/*.scss'],
                tasks: ['compass'],
                options: {
                    spawn: false
                }
            },
            js: {
                files: ['./js/**/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false
                }
            }
        }




    });

    grunt.loadNpmTasks('grunt-twig-render');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('prod', ['clean:prod', 'twigRender:dist', 'copy:prod', 'htmlmin:prod']);


};
