'use struct';
$(function() {

    var isMobile = (function(a) {
        return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
    })(navigator.userAgent || navigator.vendor || window.opera);

    var controller = new ScrollMagic.Controller();
    TweenLite.set($('body'), {
        visibility: 'visible'
    })

    //Animacin eje social interno
    if ($('#internal').size() && !isMobile) {

        var Timeline1 = new TimelineLite();
        var Timeline2 = new TimelineMax();
        var Timeline3 = new TimelineMax();
        var Timeline4 = new TimelineMax();
        var stateCoun = true;

        //Elements
        var braketLeft = $('#braket-left');
        var braketRight = $('#braket-right');
        var contributors = $('#contributors');
        var developmentPlans = $('#development-plans');

        // //Animacion title 900
        // var title1 = Timeline1.fromTo($('#title-id'), 0.5, {
        //     opacity: 0
        // }, {
        //     opacity: 1
        // });
        countString($('.count-infografia-widget'), 1500);

        //Llaves azules
        var animShowBraketLeft = TweenMax.fromTo(braketLeft, 0.3, {
            opacity: '0',
            left: '-25%',
            scale: 0.5
        }, {
            opacity: '1',
            left: '0%',
            scale: 1
        });
        var animShowBraketRight = TweenMax.fromTo(braketRight, 0.3, {
            opacity: '0',
            right: '-25%',
            scale: 0.5
        }, {
            opacity: '1',
            right: '0%',
            scale: 1
        });
        var animContributors = TweenMax.fromTo(contributors, 0.3, {
            opacity: '0',
            bottom: '-25%',
            scale: 0.5
        }, {
            opacity: '1',
            bottom: '0%',
            scale: 1
        });

        //Puntos azules
        var dotBlue = Timeline2.add(TweenMax.staggerTo('.wrap-dot.blue span', 0.5, {
                scale: 2,
                opacity: 0
            }, 0.2))
            .add(TweenMax.staggerTo('.wrap-dot.blue span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        //Titulo rosa
        var titlePink = Timeline2.fromTo($('#title-pink'), 1.5, {
            left: -75,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            left: 0,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        //Puntos azules
        var dotRed = Timeline2.add(TweenMax.staggerTo('.wrap-dot.red span', 0.5, {
                scale: 2,
                opacity: 0
            }, 0.9))
            .add(TweenMax.staggerTo('.wrap-dot.red span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.9));


        //Title faces
        var titleFaces = Timeline3.fromTo($('#title-faces'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        //Faces
        var faces = Timeline3.add(TweenMax.staggerTo('.wrap-faces .icons-anim', 0.5, {
                scale: 0.5,
                opacity: 0
            }, 0.9))
            .add(TweenMax.staggerTo('.wrap-faces .icons-anim', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.9));

        //Title faces
        var title2Faces = Timeline3.fromTo($('#title-faces2'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });


        //Puntos amarillos
        var dotYellow = Timeline4.add(TweenMax.staggerTo('.wrap-dot.yellow span', 0.5, {
                scale: 2,
                opacity: 0
            }, 0.9))
            .add(TweenMax.staggerTo('.wrap-dot.yellow span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));


        //Title faces
        var titleBestQuality = Timeline4.fromTo($('#title-best-quality'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });


        //Faces
        var iconsBestQuality = Timeline4.add(TweenMax.staggerTo('#icons-best-quality .icons-anim', 0.5, {
                scale: 0.5,
                opacity: 0
            }, 0.9))
            .add(TweenMax.staggerTo('#icons-best-quality .icons-anim', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.9));


        //ScrollMagic
        var Scene1 = new ScrollMagic.Scene({
                triggerElement: '#internal',
                offset: 300,
                duration: 200
            })
            .setTween([animShowBraketLeft, animShowBraketRight])
            .on('start end', function(e) {
                if (stateCoun) {
                    // e.type === 'end' ? countString($('.count-infografia-widget'), 1500) : '';
                }
            })
            .addTo(controller);


        //
        var Scene2 = new ScrollMagic.Scene({
                triggerElement: '#internal',
                offset: 600,
                duration: 400
            })
            .setTween([dotBlue, titlePink])
            .addTo(controller);

        var Scene3 = new ScrollMagic.Scene({
                triggerElement: '#internal',
                offset: 900,
                duration: 400
            })
            .setTween([faces])
            .addTo(controller);

        var Scene4 = new ScrollMagic.Scene({
                triggerElement: '#internal',
                offset: 1400,
                duration: 400
            })
            .setTween([dotYellow])
            .addTo(controller);

    } else {

        if ($('#internal').size() && isMobile) {
            countString($('.count-infografia-widget'), 1500);
            $('[data-anim]').each(function(index, el) {
                var classe = $(el).data('anim');
                $(el).addClass($(el).data('anim'));
            });
            // $('.content-scroll-widget').addClass('not-magicScroll');
            if ($('[data-anim]').size()) {
                //Animacion de elmentos
                window.sr = ScrollReveal();
                sr.reveal('.animate-show');
            }
        }

    }



    // if($('#content-scroll-economic').size() && isMobile){
    //
    //   $('[data-anim]').each(function(index, el) {
    //     var classe = $(el).data('anim');
    //     $(el).addClass($(el).data('anim'));
    //   });
    //   $('.content-scroll-widget').addClass('not-magicScroll');
    //   if($('[data-anim]').size()){
    //     //Animacion de elmentos
    //     window.sr = ScrollReveal();
    //     sr.reveal('.animate-show');
    //   }
    // }

    function countString(NODE, DURATION) {
        //Animacion de contador numerico
        jQuery({
            Counter: 0
        }).animate({
            Counter: $(NODE).data('count')
        }, {
            duration: DURATION,
            easing: 'swing',
            step: function() {
                $(NODE).text(Math.ceil(this.Counter));
            }
        });
        stateCoun = false;
    } //countString



    //Animacion eje economico
    if ($('#content-scroll-economic').size() && !isMobile) {

        var Timeline1 = new TimelineLite();
        var Timeline2 = new TimelineMax();
        var Timeline3 = new TimelineMax();
        var Timeline4 = new TimelineMax();


        //Nodos



        //Animaciones
        //Iconos cuadro verde
        var IconsGreen = Timeline1.add(TweenMax.staggerTo('#wrap-icons-green .icons-anim', 0.5, {
                scale: 0.5,
                opacity: 0
            }, 0.9))
            .add(TweenMax.staggerTo('#wrap-icons-green .icons-anim', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.9));


        //rojos debajo
        var dotRed2 = Timeline1.add(TweenMax.staggerTo('#icons-red-1 span', 0.5, {
                scale: 2,
                opacity: 0
            }, 0.2))
            .add(TweenMax.staggerTo('#icons-red-1 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        //Titulo Black
        var green2 = Timeline1.fromTo($('#title-green2'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });


        ///
        var iconsEconomicValue = Timeline2.fromTo($('#icon-economic'), 1.5, {
            scale: 0.5,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        var titleEconomicValue = Timeline2.fromTo($('#title-economic-value'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });


        var animPeoples = Timeline2.fromTo($('#peoples'), 0.3, {
            opacity: '0',
            bottom: '-25%',
            scale: 0.5
        }, {
            opacity: '1',
            bottom: '0%',
            scale: 1
        });


        var titleEconomicAccionistas = Timeline3.fromTo($('#title-economic-accionistas'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        var dotRed3 = Timeline3.add(TweenMax.staggerTo('#icons-red3 span', 0.5, {
                scale: 2,
                opacity: 0
            }, 0.2))
            .add(TweenMax.staggerTo('#icons-red3 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        var titleEconomicAccionistas = Timeline3.fromTo($('#title-awards'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        ///
        Timeline3.fromTo($('#awards'), 1.5, {
            scale: 0.5,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        var AnimTimeline4 = Timeline4.fromTo($('#title-grey'), 1.5, {
            scale: 2,
            opacity: 0,
            ease: Bounce.easeOut,
            y: 0
        }, {
            scale: 1,
            opacity: 1,
            ease: Bounce.easeOut,
            y: 0
        });

        Timeline4.add(TweenMax.staggerTo('.wrap-dot.yellow span', 0.5, {
                scale: 2,
                opacity: 0
            }, 0.2))
            .add(TweenMax.staggerTo('.wrap-dot.yellow span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));


        //ScrollMagic
        var Scene1 = new ScrollMagic.Scene({
                triggerElement: '#content-scroll-economic',
                offset: 350,
                duration: 300
            })
            .setTween([IconsGreen])
            .addTo(controller);


        //ScrollMagic
        var Scene2 = new ScrollMagic.Scene({
                triggerElement: '#content-scroll-economic',
                offset: 750,
                duration: 300
            })
            .setTween([iconsEconomicValue])
            .addTo(controller);

        //ScrollMagic
        var Scene3 = new ScrollMagic.Scene({
                triggerElement: '#content-scroll-economic',
                offset: 1400,
                duration: 300
            })
            .setTween([titleEconomicAccionistas])
            .addTo(controller);

        //ScrollMagic
        var Scene4 = new ScrollMagic.Scene({
                triggerElement: '#content-scroll-economic',
                offset: 1750,
                duration: 300
            })
            .setTween([AnimTimeline4])
            .addTo(controller);






    } else {

        if ($('#content-scroll-economic').size() && isMobile) {

            $('[data-anim]').each(function(index, el) {
                var classe = $(el).data('anim');
                $(el).addClass($(el).data('anim'));
            });
            if ($('[data-anim]').size()) {
                //Animacion de elmentos
                window.sr = ScrollReveal();
                sr.reveal('.animate-show');
            }
        }

    }

    //Animacion eje social externo
    if ($('#external').size() && !isMobile) {

        var Timeline = new TimelineMax();
        var Timeline2 = new TimelineMax();
        var Timeline3 = new TimelineMax();

        //Nodos

        //Animaciones
        
        //rojos debajo
        var first = Timeline.add(TweenMax.staggerTo('#dots-1 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        first.add(TweenMax.to('#text-1', 0.5, {
                scale: 1,
                opacity: 1,
                ease: Bounce.easeOut
            }, 0.2));

        first.add(TweenMax.staggerTo('#icons div', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        first.add(TweenMax.staggerTo('#dots-2 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        first.add(TweenMax.staggerTo('.block-bg--impact .text-anim', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        var second = Timeline2.add(TweenMax.staggerTo('#dots-3 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        second.add(TweenMax.staggerTo('#text-2', 0.5, {
                y: 0,
                opacity: 1
            }, 0.2));

        var third = Timeline3.add(TweenMax.staggerTo('#dots-4 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        third.add(TweenMax.to('#text-3', 0.5, {
                y: 0,
                opacity: 1
            }, 0.2));


        //ScrollMagic
        var Scene1 = new ScrollMagic.Scene({
                triggerElement: '#external',
                offset: 300,
                duration: 800
            })
            .setTween([first])
            .addTo(controller);

        var Scene2 = new ScrollMagic.Scene({
                triggerElement: '#external',
                offset: 1300,
                duration: 300
            })
            .setTween([second])
            .addTo(controller);

        var Scene3 = new ScrollMagic.Scene({
                triggerElement: '#external',
                offset: 1700,
                duration: 300
            })
            .setTween([third])
            .addTo(controller);






    }

    //Animacion eje ambiental
    if ($('#content-scroll-environment').size() && !isMobile) {

        var Timeline = new TimelineMax();
        var Timeline2 = new TimelineMax();
        var Timeline3 = new TimelineMax();

        //Nodos

        //Animaciones
        
        //rojos debajo
        var first = Timeline.add(TweenMax.staggerTo('#dots-1 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        first.add(TweenMax.staggerTo('.block-bg--flag .text-anim', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        first.add(TweenMax.staggerTo('#dots-2 span', 0.5, {
                scale: 1,
                opacity: 1
            }, 0.2));

        //ScrollMagic
        var Scene1 = new ScrollMagic.Scene({
                triggerElement: '#content-scroll-environment',
                offset: 450,
                duration: 800
            })
            .setTween([first])
            .addTo(controller);

    } else {

        if ($('#content-scroll-environment').size() && isMobile) {

            $('[data-anim]').each(function(index, el) {
                var classe = $(el).data('anim');
                $(el).addClass($(el).data('anim'));
            });
            if ($('[data-anim]').size()) {
                //Animacion de elmentos
                window.sr = ScrollReveal();
                sr.reveal('.animate-show');
            }
        }

    }


});
