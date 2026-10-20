'use strict';
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.
$(function() {
    /*
    http://kimmobrunfeldt.github.io/progressbar.js/#example-circle
    Circle bar
    */
    var newSliderSteps = {

        init: function() {

            var _this = this;
            this.listAnims = [];
            this.globalDuration = 1500;
            this.pause = 6000;
            this.initSlider();
            this.addClassProgress();
            //Espero medio segundo para inicializar el primer slider
            setTimeout(function() {
                _this.initFirst();
            }, 500);

        },
        initFirst: function() {

            var _this = this;
            _this.countString($('.count-number-widget')[1], _this.globalDuration);
            _this.listAnims[1].circle.animate(1);

        },
        //Agrego una clase diferente a cada div del progress bar
        addClassProgress: function() {

            var _this = this;
            $('.progress-bar-widget').each(function(index, el) {
                $(el).addClass('progress-bar-' + index);
                $(el).attr('data-progress', 'progress-bar-' + index);
                //Por cada clase agregada inicializo un progress bar
                _this.initProgress(index);
            });

        },
        initProgress: function(INDEX) {

            var _this = this;
            //Inicializo cada progress bar
            var Circle = new ProgressBar.Circle('.progress-bar-' + INDEX, {
                    color: '#ffffff',
                    strokeWidth: 3,
                    trailWidth: 1,
                    trailColor: 'none',
                    duration: _this.globalDuration + 800,
                    step: function(state, bar) {

                    }
                })
                //Almaceno el progressbar en un arreglo
            this.listAnims.push({
                id: 'progress-bar-' + INDEX,
                circle: Circle
            });

        },
        //Inicializo el plugin de slider
        initSlider: function() {

            var _this = this;

            this.sliderPlugin = $('.slider-widget').bxSlider({
                adaptiveHeight: true,
                mode: 'horizontal',
                pager: true,
                controls: false,
                infiniteLoop: true,
                auto: true,
                pause: _this.pause,
                onSlideAfter: function($slideElement, oldIndex, newIndex) {
    
    
                    //En cada transicion de slider ejecuto un metodo de reset e inint que limpian el slider que acada de ejecutarse e inicializan el nuevo
                    _this.resetSlider($slideElement, oldIndex, newIndex)
                    _this.initCount($slideElement, oldIndex, newIndex)
                }

            });
            //

        },
        initCount: function(SlideElement, oldIndex, newIndex) {

            var _this = this;
            var NodeCount = $(SlideElement).find('[data-count]');
            var progressClass = $(SlideElement).find('[data-progress]');
            progressClass = progressClass.data('progress');
            //Espero
            setTimeout(function() {
                //Inicio el contador numerico de el slider actual
                _this.countString(NodeCount, _this.globalDuration);
                //Recorro los progress-bar para ejecutar el progress bar del slider actual
                for (var i = 0; i < _this.listAnims.length; i++) {
                    if (_this.listAnims[i].id === progressClass) {
        
                        _this.listAnims[i].circle.animate(1);
                    }
                }

            }, 800);

        },
        resetSlider: function(SlideElement, oldIndex, newIndex) {

            var _this = this;
            //Limpio el contador numerico
            $('.count-number-widget').empty().text(0);
            //Limpio los progress-bar que se ejecutaron
            for (var i = 0; i < _this.listAnims.length; i++) {
                _this.listAnims[i].circle.animate(0);
            }

        },
        countString: function(NODE, DURATION) {
            //Animacion de contador numerico
            jQuery({
                Counter: 0
            }).animate({
                Counter: $(NODE).data('count')
            }, {
                duration: DURATION,
                easing: 'swing',
                step: function() {
                    /
                    $(NODE).text(Math.ceil(this.Counter));
                }
            });
        }

    };
    $('.progress-bar-widget').size() ? newSliderSteps.init() : '';


    //Animacion de elmentos
    window.sr = ScrollReveal();
    sr.reveal('.animate-show');

});
