$(function() {

    "use strict";

    // Javascript to enable link to tab
    var hash = document.location.hash;
    var prefix = "tab_";
    if (hash) {
        $('.tabs a[href='+hash.replace(prefix,"")+']').tab('show');
        $( "body" ).scrollTop( 0 );
    } 

    // Change hash for page-reload
    $('.tabs a').on('shown', function (e) {
        window.location.hash = e.target.hash.replace("#", "#" + prefix);
    });

    //Scroll to
    $('.scroll-to-widget').on('click', function() {
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top - 64
        }, 800);
    });
    //Open Menu lateral
    $('.open-menu-widget').on('click', function(event) {
      event.preventDefault();
      $('body').toggleClass('open-menu');
    });

    //
    var AppGridRandom = {
        init: function() {
            this.itemLst = [];
            this.randomList;
            this.randomOrder;
            this.processItemList();
        },
        processItemList: function() {
            var _this = this;
            var promise = this.loadItems();
            promise.then(function(Success) {

                var Items = $.parseHTML(Success);
                Items = $(Items).find('p').closest('div');
                for (var i = 0; i < Items.length; i++) {
                    _this.itemLst.push(Items[i]);
                }
                _this.generateList();
                _this.generateOrderList();
                _this.addItemToGrid();
                _this.randomFlip();
                

            }, function(Error) {
                
            });

        },
        loadItems: function() {

            var deferred = $.Deferred();
            $.ajax({
                url: '/partials/logros.html',
                type: 'GET',
                success: function(data) {
                    
                    deferred.resolve(data);
                },
                error: function(error, errorData) {
                    deferred.reject(error, errorData);
                }
            });
            return deferred.promise();

        },
        random: function(MAX, MIN) {
            return Math.floor(Math.random() * MAX) + MIN;
        },
        generateList: function() {

            var MAX = 20;
            var _this = this;
            var tempList = [];
            var randomInit = _this.random(MAX, 0);
            //Inserto el primer elemento
            tempList.push({
                id: randomInit,
                nodo: $(_this.itemLst[randomInit]).clone(true)
            });
            //
            while (tempList.length < MAX) {

                var randomTempo = _this.random(MAX, 0);
                var stateNotExist = true;
                for (var i = 0; i < tempList.length; i++) {
                    if (tempList[i].id === randomTempo) {
                        stateNotExist = false;
                        
                    }
                }
                if (stateNotExist) {
                    
                    tempList.push({
                        id: randomTempo,
                        nodo: $(_this.itemLst[randomTempo]).clone(true)
                    });
                } //End if

            } //End while
            
            
            this.randomList = tempList;

        }, //generateList
        generateOrderList: function() {

            var MAX = 10;
            var _this = this;
            var tempList = [];
            var randomInit = _this.random(MAX, 0);
            //Inserto el primer elemento
            tempList.push(randomInit);
            //
            while (tempList.length < MAX) {

                var randomTempo = _this.random(MAX, 0);
                var stateNotExist = true;
                for (var i = 0; i < tempList.length; i++) {
                    if (tempList[i] == randomTempo) {
                        stateNotExist = false;
                    }
                }
                if (stateNotExist) {
                    tempList.push(randomTempo);
                } //End if

            } //End while
            
            
            this.randomOrder = tempList;
        },
        addItemToGrid: function(REPEAT) {

            var _this = this;
            var front;
            var back;
            var countNode = 0;
            // if(REPEAT === true){
            //
            //   
            //   // $('.list-grid-widget').find('li').each(function(index, el) {
            //   //     
            //   //
            //   //     if($(el).find('.flip-container').hasClass('active')){
            //   //       
            //   //       
            //   //       $(el).find('.front').empty().append(_this.randomList[countNode].nodo);
            //   //     }else{
            //   //       
            //   //       $(el).find('.back').empty().append(_this.randomList[countNode].nodo);
            //   //     }
            //   //     countNode++;
            //   //
            //   // });
            //
            // }else{
            //
            //
            //
            // }
            
            //
            $('.list-grid-widget').find('li').each(function(index, el) {

                front = $(el).find('.front').append(_this.randomList[countNode].nodo);
                countNode++;
                back = $(el).find('.back').append(_this.randomList[countNode].nodo);
                countNode++;

            });
            _this.randomList = [];

        },
        randomFlip: function() {

            var _this = this;
            this.randomOrder;
            var count = 0;

            var listItems = $('.list-grid-widget').find('li');
            var flipPlace = '.back';

            setInterval(function() {

                if (count == listItems.length) {
                    count = 0;
                    if(flipPlace === '.back'){
                      flipPlace = '.front';
                    }else{
                      flipPlace = '.back';
                    }
                    
                    _this.generateList();
                    _this.generateOrderList();
                    _this.replaceItem(flipPlace);
                }

                $(listItems[_this.randomOrder[count]]).addClass('over');
                if ($(listItems[_this.randomOrder[count]]).find('.flip-container').hasClass('active')) {
                    $(listItems[_this.randomOrder[count]]).find('.flip-container').removeClass('active');
                } else {
                    $(listItems[_this.randomOrder[count]]).find('.flip-container').addClass('active');
                }

                

                count++;
                
            }, 2000);

        },
        replaceItem: function(PLACE){

          var _this = this;
          var listItems = $('.list-grid-widget').find('li').find(PLACE);
          
          listItems.each(function(index, el) {
            
            $(el).empty().append(_this.randomList[index].nodo);
          });

          // back = $(el).find('.back').empty().append(_this.randomList[countNode].nodo);

        }

    };
    AppGridRandom.init();






    ///
    // Cache selectors
    var lastId,
        topMenu = $("#top-menu"),
        topMenuHeight = topMenu.outerHeight() + 15,
        // All list items
        menuItems = topMenu.find("a"),
        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function() {
            var item = $($(this).attr("href"));
            if (item.length) {
                return item;
            }
        });

    // Bind to scroll
    $(window).scroll(function() {
        // Get container scroll position
        var fromTop = $(this).scrollTop() + topMenuHeight;

        // Get id of current scroll item
        var cur = scrollItems.map(function() {
            if ($(this).offset().top - 120 < fromTop) {
                return this;
            }

        });
        // Get the id of the current element
        cur = cur[cur.length - 1];
        var id = cur && cur.length ? cur[0].id : "";

        if (lastId !== id) {
            lastId = id;
            // Set/remove active class
            menuItems.parent().removeClass("active").end().filter("[href=#" + id + "]").parent().addClass("active");
        }
    });


});

(function() {

    function addEvent(element, event, fn) {
        if (element.addEventListener) {
            element.addEventListener(event, fn, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, fn);
        }
    }
    //this function will work cross-browser for loading scripts asynchronously
    function loadScript(src, type, callback) {
        var s,
            r,
            t;
        r = false;

        if (type === 'js') {
            s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = src;
            s.async = 'async';
            s.onload = s.onreadystatechange = function() {
                //
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true;
                    if (callback !== undefined) {
                        callback();
                    }
                }
            };
            t = document.getElementsByTagName('script')[0];
        }

        if (type === 'css') {
            s = document.createElement('link');
            s.type = 'text/css';
            s.rel = 'stylesheet';
            s.href = src;
            s.onload = s.onreadystatechange = function() {
                //
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true;
                    if (callback !== undefined) {
                        callback();
                    }
                }
            };
            t = document.getElementsByTagName('link')[0];
        }

        t.parentNode.insertBefore(s, t);
    }

    addEvent(window, 'load', function() {

        loadScript(
            'https://fonts.googleapis.com/css?family=Roboto:400,300,500,700,100',
            'css'
        );

    });


}());
