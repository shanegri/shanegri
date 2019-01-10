$(function() {

  App.init();

});


var App = {
  init: function() {

    if(window.location.host.includes("127.0.0.1:5500")) {
      this.host = "http://localhost/src/";
    } else {
      this.host = "http://shanegriffin.net/";
    }

    WindowController.init();
    ScrollController.init();

    Photography.init(); 
    Nav.init();
    
    $(".video").each(function(i, obj) {
      video_obj = new Video($(obj));
      WindowController.registerResize("video", video_obj.resize.bind(video_obj));
    })

    WindowController.registerResize("nav",Nav.resize.bind(Nav));
    WindowController.registerResize("photo",Photography.resize.bind(Photography));
    WindowController.registerResize("scroll",ScrollController.resize.bind(ScrollController));


  }
}
var Nav = {
    init: function(){
        this.navTopHeight = 70;
        this.currentHash = window.location.hash;    
        this.atHome = this.currentHash == "#" || this.currentHash == "";
        this.cacheDOM();
        this.resize({width: $(window).width()})
        this.bindHandlers();  
        this.hashchange();
    },
    cacheDOM: function() {
        this.$nav = $("#nav-container");
        this.$contentCon = $("#content-container");
        this.$content = this.$contentCon.find("#content");
    },
    bindHandlers: function() {
        this.$nav.find('.nav-link').on('click', this.transition.bind(this));
        $(window).on('hashchange', this.hashchange.bind(this));
    },
    resize: function(w) {
        if(w.width > 700) {
            this.navTopHeight = 70;
        } else {
            this.navTopHeight = 110;
        }
        if(!this.atHome){
            this.$nav.css({"height": this.navTopHeight + "px"});
        }
    },

    gotoHome: function() {

        this._removeScrollHandler();

        this.atHome = true;

        this.$nav.removeClass('nav-content-top');
        this.$nav.addClass('nav-content-center');

        this.$nav.removeClass('nav-top');
        this.$nav.addClass('nav-center');
    },
    gotoHeading: function() {

        this._registerScrollHandler();

        this.atHome = false;

        this.$nav.removeClass('nav-content-center');
        this.$nav.addClass('nav-content-top');

        this.$nav.removeClass('nav-center');
        this.$nav.addClass('nav-top');
        this.$nav.css({"height": this.navTopHeight + "px"})

    },

    transitionHome: function() {

        this._removeScrollHandler();

        this.atHome = true;

        var duration = 900;

        var offset = this.$nav.position();
        var size = {height: this.$nav.height(), width: this.$nav.width()}

        this.$nav.removeClass('nav-top');

        this.$nav.css({
            top: offset.top,
            left: offset.left,
            width: size.width,
            height: size.height,
        });

        this.$nav.children()
                .velocity("stop")
                .velocity(
                    {
                        opacity: 0.0
                    },
                    {
                        duration: duration / 2,
                        complete: function() {
                            this.$nav.removeClass('nav-content-top');                                       
                            this.$nav.addClass('nav-content-center');
                        }.bind(this)
                    }
                ).velocity(
                    {
                        opacity: 1.0
                    },
                    {
                        easing: "easeOut",
                        duration: duration / 2,
                    }
                )

        this.$nav.velocity("stop")
                 .velocity(
            {
                top: $(window).height() * .25,
                width: 300,
                height: 375
            },
            {
                easing: [.52,.12,0,1],
                duration: duration,
                complete: function() {
                    this.$nav.addClass('nav-center');
                }.bind(this)
            }
        );
        
        this.$content.velocity("stop")
                     .velocity(
                         {
                            opacity: 0,
                         },
                         {
                            duration: duration / 3 
                         }
                     )
        this.$contentCon.velocity("stop")
                        .velocity("scroll", {
            offset: -100,
            complete: function() {
                this.$contentCon.hide()
            }.bind(this),
            duration: duration,
            easing: "easOut"
        });
    },
    transitionHeading: function(target) {

        var duration = 900;

        if(this.atHome) {
        this.$nav.children()
                .velocity("stop")
                .velocity(
                    { opacity: 0.0 },
                    {
                        duration: duration / 3,
                        complete: function() {
                            this.$nav.removeClass('nav-content-center');
                            this.$nav.addClass('nav-content-top');                                       
                        }.bind(this)
                    })
                .velocity(
                    { opacity: 1.0 },
                    {
                        easing: "easOut",
                        duration: duration / 3,
                    })
        }

        var offset = this.$nav.position();
        var size = {height: this.$nav.height(), width: this.$nav.width()}

        this.$nav.removeClass('nav-center');

        this.$nav.css({
            top: offset.top,
            left: offset.left,
            width: size.width,
            height: size.height,
        });

        this.$nav.velocity("stop")
                 .velocity(
            {
                top: 10,
                width: $(window).width(),
                height: this.navTopHeight
            },
            {
                easing: [.52,.12,0,1],
                duration: duration,
                complete: function() {
                    this.$nav.attr("style", "");
                    this.$nav.addClass('nav-top');
                    this.$nav.css({"height": this.navTopHeight + "px"})
                    this._registerScrollHandler();
                }.bind(this)
            }
        );

        this.$contentCon.show();
        this.$content.velocity("stop")
                    .velocity(
                        { opacity: 1.0 },
                        {
                            duration: duration / 3 
                        })
                        
        $(target).velocity("scroll", {
            easing: [.37,.04,.02,1.01],
            offset: -100,
            duration: duration
        });

        this.atHome = false;
    },
    transition: function(e) {
        var target = $(e.target).attr('href');
        e.preventDefault();
        window.history.pushState("", "", window.location.pathname + target)
        if(target == "#"){
            this.transitionHome();
        } else {
            this.transitionHeading(target);
        }

        this.currentHash = target;
    },
    hashchange: function() {

        var hash = window.location.hash;
        var prevHash = this.currentHash;
        this.currentHash = hash;

        if(hash == "#" || hash == ""){
            this.gotoHome();
        } else {
            this.gotoHeading(hash);
        }
        return;

        if(prevHash == hash) {
            if(hash == "#" || hash == ""){
                this.gotoHome();
            } else {
                this.gotoHeading(hash);
            }
            return;
        }

        if((prevHash == "#" || prevHash == "") && (hash != "#" || hash != "")) {
            this.transitionHeading(hash);
            return;
        }

        if((prevHash != "#" || prevHash != "") && (hash == "#" || hash == "")) {
            this.transitionHome();
            return;
        }
 
    },
    _registerScrollHandler: function() {
        ScrollController.registerScroll("nav", function(s) {
            if(s < 800){
                ScrollController.removeScroll("nav");
                Nav.transitionHome()
            }
        })
    },
    _removeScrollHandler: function() {
        ScrollController.removeScroll("nav");
    }
}
var Photography = {
    init: function() {
        this.$container = $("#gallery-container");
        this.$gallery = this.$container.find("#gallery");
        this.$galleryPadding = this.$container.find("#gallery-padding");
        this.photo_objs = [];
        
        this.size = 200;
        this.padding = 400;
        this.rows = 2

        $.ajax({
           url: App.host + "server/get-images.php",
           dataType: "json",
           success: ajaxSuccess.bind(this)
        });

        function ajaxSuccess(response) {
            if(response.status == "good"){
                var images = response['images'];
                for(i in images){
                    var img_url = App.host + "images/thumb/" + images[i];
                    this.photo_objs.push(new Photo(this.$gallery, img_url));
                }

                ScrollBar.init();
           
                this.setGrid({
                    size: 200,
                    padding: 400,
                    rows: 2
                });
                
                ScrollController.registerElemTransition(
                    "photoScroll", 
                    this.$container, 
                    this.transitionOn.bind(this), 
                    function() {}
                );
            }
        }

    },
    //'Recursively' calls load on each photo object
    transitionOn: function() {
        this.$container.on('scroll', this.scrollHandler.bind(this));

        if(this.isActive) return;
        this.isActive = true;

        ScrollController.removeElemTransition("photoScroll");
        function loadImages(i) {
            if(i >= this.photo_objs.length) { 
                ScrollController.registerElemTransition(
                    "photoScroll",
                    this.$container, 
                    this.transitionOn.bind(this), 
                    this.transitionReset.bind(this)
                )
                return;  
            }
            setTimeout(function() {
                this.photo_objs[i].initLoad(i + 1, loadImages.bind(this));
            }.bind(this), 100)
        }
        loadImages.bind(this)(0);
    },
    
    transitionReset: function() {
        this.$container.off('scroll');
        this.isActive = false;
        for(i in this.photo_objs) this.photo_objs[i].resetTransition();
    },

    setScroll: function(precentage){
        var newScroll = this.maxScroll * precentage;
        this.$container.scrollLeft(newScroll);
    },
    setGrid: function(settings){
        if(settings){
            this.size = assign(settings.size, this.size);
            this.padding = assign(settings.padding, this.padding);
            this.rows = assign(settings.rows, this.rows);
        }
        for(i in this.photo_objs){
            this.photo_objs[i].setSize({width: this.size, height: this.size});
        }
        this.width = (this.size / 2) + Math.ceil(this.photo_objs.length / this.rows) * this.size;
        this.height = this.size * this.rows;
        
        this.$gallery.css({width: this.width + "px", height: this.height});
        this.$galleryPadding.css({width: this.width + this.padding + "px"});

        this.resize({width: $(window).width()});
        ScrollBar.setBar((this.padding / 2) / this.maxScroll);
    },

    resize: function(w) {
        this.maxScroll = Math.max(this.$galleryPadding.width() - w.width, 0);
        ScrollBar.resize(w);
    },
    scrollHandler: function() {
        if(!ScrollBar.active) {
            if(!this.mobileScrolling) { 
                this.mobileScrolling = true;
                setTimeout(function() {
                    this.mobileScrolling = false;
                    ScrollBar.setBarStatic(this.$container.scrollLeft() / this.maxScroll);
                }.bind(this), 40);
            }
        }
    }
}

var Photo = function($photos, url) {
    this.isLoaded = false;
    this.url = url;
    this.$img = $("<img draggable='false'></img>");
    this.$img.css({opacity: 0})
    $photos.append(this.$img);
}
Photo.prototype.setSize = function(size) {
    this.$img.css(size);
}
Photo.prototype.registerHandlers = function() {
    // this.$img.on('mouseover', this.mouseover.bind(this));
    // this.$img.on('mouseleave', this.mouseleave.bind(this));
}
Photo.prototype.initLoad = function(i, complete_f) {
    if(this.isLoaded) {
        this.transitionOn(i, complete_f); 
    } else {
        this.$img.on('load', function() { 
            this.isLoaded = true;
            this.$img.off('load');
            this.transitionOn.bind(this)(); 
            complete_f(i);
        }.bind(this));
        this.$img.attr('src', this.url);
    }
}
Photo.prototype.mouseover = function() {
    this.$img.velocity("stop").velocity(
        {
            scale: 1.1,
            marginLeft: 30,
            marginRight: 30
        })
}
Photo.prototype.mouseleave = function() {
    this.$img.velocity("stop").velocity(
        {
            scale: 1.0,
            marginLeft: 0,
            marginRight: 0
        })
}
Photo.prototype.transitionOn = function(i, complete_f) {
    if(i || complete_f) complete_f(i);

    this.$img.velocity("stop").velocity(
        {
            opacity: 1.0,
            scale: [1.0, 0.9]
        },
        {
            complete: this.registerHandlers.bind(this)
        })
}
Photo.prototype.resetTransition = function() {
    this.$img.velocity("stop");
    this.$img.css({opacity: 0});
    this.$img.off("mouseover");
    this.$img.off("mouseleave");
}


var ScrollBar = {
    init: function() {
        this.$barContainer = $("#gallery-scroll-container");
        this.$bar = this.$barContainer.find('#gallery-scroll-bar')
        this.marginLeft = 0;

        this.$bar.on('mousedown', this.mousedown.bind(this));
    },
    mousedown: function(e){
        this.active = true;
        e.preventDefault();
        $(window).bind('mousemove', this.mousemove.bind(this));
        $(window).bind('mouseup', this.mouseup.bind(this));
        this.barOffset = e.clientX - this.offset - this.marginLeft;
    },
    mousemove: function(e) {
        if(!this.isScrolling){
            this.isScrolling = true;
            
            setTimeout(function() {
                this.isScrolling = false;
                this.marginLeft = e.clientX - this.offset - this.barOffset;
                this.updateBar();
            }.bind(this), 10)
        }
    },
    mouseup: function() {
        this.active = false;
        $(window).unbind('mousemove');
        $(window).unbind('mouseup');
    },
    updateBar: function() {
        if(this.marginLeft < 0) this.marginLeft = 0;
        if(this.marginLeft > this.maxScroll) this.marginLeft = this.maxScroll;
        this.$bar.css({"margin-left": this.marginLeft});
        Photography.setScroll(this.marginLeft / this.maxScroll);
    },
    resize: function(w) {
        this.barConWidth = this.$barContainer.width();
        this.barWidth = this.$bar.width();
        this.offset = Math.floor((w.width - this.barConWidth) / 2)
        this.maxScroll = this.barConWidth - this.barWidth;
        this.updateBar();
    },
    setBar: function(precent) {
        this.marginLeft = this.maxScroll * precent;
        this.updateBar();
    },
    setBarStatic: function(precent) {
        this.marginLeft = precent * this.maxScroll;
        this.$bar.css({"margin-left": this.marginLeft});
    }
}
var ScrollController =  {
//Inform Each st object when to run 
//Maintain scroll handler
//Dispose of scroll handler when at home

init: function() {
    this.$window = $(window);
    this.bindHandlers();
    this.scrollCallbacks = {};
    this.scrollElems = [];
    $(".animate-on-left").each(function(i, obj) {
        this.scrollElems.push(new ScrollTransition($(obj), "left"));
    }.bind(this));
    $(".animate-on-right").each(function(i, obj) {
        this.scrollElems.push(new ScrollTransition($(obj), "right"));
    }.bind(this));
    this.resize({height: $(window).height()});
},
scroll: function() {
    if(!this.isScrolling) {
        this.isScrolling = true;
        setTimeout(function() {
            this.isScrolling = false
            var lowerBound = this.$window.scrollTop();
            var upperBound = lowerBound + this.height;
        
            for(i in this.scrollElems) this.scrollElems[i].checkScroll(lowerBound, upperBound);
        
            for(i in this.scrollCallbacks) this.scrollCallbacks[i](lowerBound, upperBound);
        }.bind(this), 180)
    }
},
resize: function(w) {
    this.height = w.height;
},
bindHandlers: function() {
    this.$window.bind("scroll", this.scroll.bind(this));
},
unbindHandlers: function() {
    this.$window.unbind('scroll');
},
registerScroll: function(key, callback){
    this.scrollCallbacks[key] = callback;
},
removeScroll: function(key) {
    if(this.scrollCallbacks[key])
        delete this.scrollCallbacks[key]
},
registerElemTransition: function(key, $elem, scroll_f, resize_f) {
    this.scrollCallbacks[key] = function(lowerBound, upperBound) {
        var top = $elem.position().top;
        var height = $elem.height();
        var animateBound = top + 100 > upperBound;
        var resetBound = top - 250 > upperBound;
        if(!animateBound) {
            scroll_f();
        } else if(resetBound) {
            resize_f();
        }
    }
},
removeElemTransition: function(key) {
    this.removeScroll(key);
}

};

var ScrollTransition = function($elem, leftOrRight) {
    this.translateAmt = leftOrRight == "left" ? -75 : 75;
    this.animating = false;
    this.active = true;
    this.$elem = $elem;
    this.top = $elem.position().top;
    this.height = $elem.height();
    this.checkScroll();
};
ScrollTransition.prototype.checkScroll = function(lowerBound, upperBound) {
    var outOfUpperBound = (this.top + this.height) < lowerBound;
    var animateBound = this.top + 100 > upperBound;
    var resetBound = this.top - 250 > upperBound;
    if(!animateBound) {
        this.animateOn();
    } else if(resetBound) {
        this.reset();
    }
};
ScrollTransition.prototype.reset = function() {
    this.active = false;
    this.$elem.css( { opacity: 0.0 })
};
ScrollTransition.prototype.animateOn = function() {
    if(this.animating || this.active) return;
    
    this.animating = true;
    this.$elem.delay(0).velocity("stop").velocity(
        {
            translateX: [0, this.translateAmt],
            opacity: 1.0
        },
        {
            easing: "ease",
            duration: 800,
            complete: function() {this.active = true; this.animating = false}.bind(this)
        }
    );
};

var Video = function($frame) {
    this.$frame = $frame;
    this.resize();
}
Video.prototype.resize = function() {
    this.$frame.css({
    height: (1080/1920) * this.$frame.width()
    });
}
var WindowController = {
    resizeCallbacks:  {},
    init: function() {
        $(window).on('resize', this.resizeThrottle.bind(this));
    },
    registerResize: function(key, callback){
        this.resizeCallbacks[key] = callback;
    },
    removeResize: function(key) {
        if(this.resizeCallbacks)
        delete this.resizeCallbacks[key];
    },
    resize: function() {
      var width = $(window).width();
      var height = $(window).height();
      var size = {width: width, height: height};
      for(i in this.resizeCallbacks) {
          this.resizeCallbacks[i](size);
      }  
    },
    resizeThrottle: function() {
        if(!this.isResizing) {
            this.isResizing = true;
            setTimeout(function() {
                this.isResizing = false;
                this.resize();
            }.bind(this), 300);
        }
    }

}
function assign(value, prevValue) {
    return typeof value == 'undefined' ? prevValue : value;
}
