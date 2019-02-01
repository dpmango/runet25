// force scroll to top on initial load
window.onbeforeunload = function(){
  window.scrollTo(0,0)
}

$(window).on("load", function(){
  $.ready.then(function(){
    window.onLoadTrigger()
  });
})

$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);
  var lastScrollBodyLock = 0;
  var lastScrollDir = 0;

  var easingSwing = [.02, .01, .47, 1]; // default jQuery easing

  var scroll = {
    y: _window.scrollTop(),
    direction: undefined,
    blocked: false,
    lastForBodyLock: 0,
    lastForScrollDir: 0
  }

  var header = {
    container: undefined,
    bottomPoint: undefined
  }

  var browser = {
    isRetinaDisplay: isRetinaDisplay(),
    isIe: msieversion(),
    isMobile: isMobile()
  }
  window.browser = browser

  var sliders = [] // collection of all sliders

  var startWindowScroll = 0
  var closeMarkup = '<button title="%title%" class="mfp-close"><svg class="ico ico-mono-close"><use xlink:href="img/sprite-mono.svg#ico-mono-close"></use></svg></button>'
  var defaultPopupOptions = {
    type: 'inline',
    fixedContentPos: true,
    fixedBgPos: true,
    overflowY: 'auto',
    closeBtnInside: true,
    preloader: false,
    midClick: true,
    removalDelay: 300,
    mainClass: 'popup-buble',
    closeMarkup: closeMarkup,
    callbacks: {
      beforeOpen: function() {
        startWindowScroll = _window.scrollTop();
        // $('html').addClass('mfp-helper');
      },
      close: function() {
        // $('html').removeClass('mfp-helper');
        _window.scrollTop(startWindowScroll);
      }
    }
  }

  ////////////
  // LIST OF FUNCTIONS
  ////////////

  // some functions should be called once only
  legacySupport();
  initaos();
  preloaderDone();

  // The new container has been loaded and injected in the wrapper.
  function pageReady(fromPjax){
    getHeaderParams();
    closeMobileMenu();

    initPopups();
    initPerfectScrollbar();
    initMasks();
    initSelectric();
    initScrollMonitor();
    initValidations();
    initTeleport();
  }

  // The transition has just finished and the old Container has been removed from the DOM.
  function pageCompleated(fromPjax){
    initLazyLoad();
    if ( fromPjax ){
      AOS.refreshHard();
      window.onLoadTrigger()
    }
  }

  // some plugins work best with onload triggers
  window.onLoadTrigger = function onLoad(){
    preloaderDone();
    initLazyLoad();
  }

  // this is a master function which should have all functionality
  pageReady();
  pageCompleated();

  // scroll/resize listeners
  _window.on('scroll', getWindowScroll);
  _window.on('scroll', scrollHeader);
  _window.on('resize', debounce(setBreakpoint, 200))


  //////////
  // COMMON
  //////////

  // detectors
  function isRetinaDisplay() {
    if (window.matchMedia) {
        var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
        return (mq && mq.matches || (window.devicePixelRatio > 1));
    }
  }

  function isMobile(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      return true
    } else {
      return false
    }
  }

  function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true
    } else {
      return false
    }
  }

  function initaos() {
    AOS.init({
      // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
      offset: 120, // offset (in px) from the original trigger point
      delay: 0, // values from 0 to 3000, with step 50ms
      duration: 400, // values from 0 to 3000, with step 50ms
      easing: 'ease-in', // default easing for AOS animations
      once: true, // whether animation should happen only once - while scrolling down
      mirror: false, // whether elements should animate out while scrolling past them
      anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation
    });
  }

  function legacySupport(){
    // svg support for laggy browsers
    svg4everybody();

    // Viewport units buggyfill
    window.viewportUnitsBuggyfill.init({
      force: false,
      refreshDebounceWait: 150,
      appendToBody: true
    });

    if ( browser.isIe ){
      $('body').addClass('is-ie');

      // ie pollyfil for picture tag
      // (will be called on itialization - use as lazy load callback)
      // picturefill();
    }

    if ( browser.isMobile ){
      $('body').addClass('is-mobile');
    }
  }

  // preloader
  function preloaderDone(){
    $('#barba-wrapper').addClass('is-preloaded');
  }

  // Prevent # behavior
	_document
    .on('click', '[href="#"]', function(e) {
      e.preventDefault();
    })
    .on('click', '[js-link]', function(e){
      var dataHref = $(this).data('href');
      if (dataHref && dataHref !== "#"){
        e.preventDefault();
        e.stopPropagation();
        Barba.Pjax.goTo(dataHref);
      }
    })
    // prevent going the same link (if barba is connected)
    .on('click', 'a, [js-link]', function(e){
      var href = $(this).data('href') || $(this).attr('href');
      var path = window.location.pathname

      if ( href === path.slice(1, path.length) ){
        e.preventDefault();
        e.stopPropagation();
      }
    })
    // scroll to section
    .on('click', '[js-scroll-to]', function() { // section scroll
      var target = $(this).data('scroll-target');
      var el = $(target)
      var topTarget = $(el).offset().top
      var offset = $(this).data("offset")
      if ( offset ){
        topTarget -= offset
      }

      // $('body, html').animate({scrollTop: topTarget}, 1000);
      TweenLite.to(window, 1, {
        scrollTo: {y: topTarget, autoKill:false},
        ease: easingSwing
      });

      return false;
    })

  // just store global variable with scroll distance
  function getWindowScroll(){
    if ( scroll.blocked ) return

    var wScroll = _window.scrollTop()
    scroll.y = wScroll
    scroll.direction = wScroll > scroll.lastForScrollDir ? "down" : "up"

    scroll.lastForScrollDir = wScroll <= 0 ? 0 : wScroll;
  }


  // HEADER SCROLL
  function getHeaderParams(){
    var $header = $('.header')
    var headerWrapperTranslate = 40
    var headerHeight = $header.outerHeight() + headerWrapperTranslate

    header = {
      container: $header,
      bottomPoint: headerHeight
    }
  }

  function scrollHeader(){
    if ( header.container !== undefined ){
      var fixedClass = 'is-fixed';
      var visibleClass = 'is-fixed-visible';

      if ( scroll.blocked ) return

      if ( scroll.y > header.bottomPoint ){
        header.container.addClass(fixedClass);

        if ( (scroll.y > header.bottomPoint * 2) && scroll.direction === "up" ){
          header.container.addClass(visibleClass);
        } else {
          header.container.removeClass(visibleClass);
        }
      } else {
        // emulate position absolute by giving negative transform on initial scroll
        var normalized = Math.floor(normalize(scroll.y, header.bottomPoint, 0, 0, 100))
        var reverseNormalized = (100 - normalized) * -1

        header.container.css({
          "transform": 'translate3d(0,'+ reverseNormalized +'%,0)',
        })

        header.container.removeClass(fixedClass);
      }
    }
  }

  ////////////////////
  // HAMBURGER TOGGLER
  ////////////////////
  // disable / enable scroll by setting negative margin to page-content eq. to prev. scroll
  // this methods helps to prevent page-jumping on setting body height to 100%
  function disableScroll() {
    scroll.lastForBodyLock = _window.scrollTop();
    scroll.blocked = true
    $('.page__content').css({
      'margin-top': '-' + scroll.lastForBodyLock + 'px'
    });
    $('body').addClass('body-lock');
  }

  function enableScroll(isOnload) {
    scroll.blocked = false
    scroll.direction = "up" // keeps header
    $('.page__content').css({
      'margin-top': '-' + 0 + 'px'
    });
    $('body').removeClass('body-lock');
    if ( !isOnload ){
      _window.scrollTop(scroll.lastForBodyLock)
      scroll.lastForBodyLock = 0;
    }
  }

  function blockScroll(isOnload) {
    if ( isOnload ){
      enableScroll(isOnload)
      return
    }
    if ($('.header').is('.is-menu-active')) {
      disableScroll();
    } else {
      enableScroll();
    }
  };

  _document.on('click', '[js-hamburger]', function(){
    $('.header').toggleClass('is-menu-active');
    changeHamburgerText()
    $('.main-menu').toggleClass('is-active');

    blockScroll();
  });

  function closeMobileMenu(isOnload){
    $('.header').removeClass('is-menu-active');
    changeHamburgerText()
    $('.main-menu').removeClass('is-active');

    blockScroll(isOnload);
  }

  function changeHamburgerText(isActive){
    var $name = $('.header__menu-name');

    if ( $('.header').is(".is-menu-active") ){
      $name.text($name.data("activeText"))
    } else {
      $name.text($name.data("text"))
    }
  }

  /***************
  * PAGE SPECIFIC *
  ***************/

  _document
    .on('click', '[js-inner-page-btn]', function(){

    })


  /**********
  * PLUGINS *
  **********/


  //////////
  // MODALS
  //////////

  function initPopups(){
    // Magnific Popup
    $('[js-popup]').magnificPopup(defaultPopupOptions);
  }

  function closeMfp(){
    $.magnificPopup.close();
  }

  _document
    .on('click', '[js-close-mfp]', closeMfp)

  //////////
  // LAZY LOAD
  //////////
  function initLazyLoad(){

    var $lazy = _document.find('[js-lazy]');
    if ($lazy.length === 0 ) {
      ieFixPictures();
      return
    }

    var fadeTimeout = 250

    $lazy.Lazy({
      threshold: 400, //Amount of pixels below the viewport, in which all images gets loaded before the user sees them.
      enableThrottle: true,
      throttle: 100,
      scrollDirection: 'vertical',
      // effect: 'fadeIn',
      // effectTime: fadeTimeout,
      // visibleOnly: true,
      onError: function(element) {
        console.log('error loading ' + element.data('src'));
        try{
          element.attr('src', element.data('src'))
        } catch(e){
          console.log('eroor appending src', e)
        }

      },
      beforeLoad: function(element){
        // element.attr('style', '')
      },
      afterLoad: function(element){
        animateLazy(element)
      },
      onFinishedAll: function(){
        ieFixPictures()
      }
    });

  }

  function ieFixPictures(){
    if ( window.browser.isIe ){
      // ie pollyfils
      picturefill();
      window.fitie.init()
    }
  }

  window.ieFixPictures = ieFixPictures()



  ////////////
  // SCROLLBAR
  ////////////
  function initPerfectScrollbar(){
    if ( $('[js-scrollbar]').length > 0 ){
      $('[js-scrollbar]').each(function(i, scrollbar){
        var ps;

        function initPS(){
          ps = new PerfectScrollbar(scrollbar, {
            // wheelSpeed: 2,
            // wheelPropagation: true,
            minScrollbarLength: 20
          });
        }

        initPS();

        // toggle init destroy
        function checkMedia(){
          if ( $(scrollbar).data('disable-on') ){

            if ( mediaCondition($(scrollbar).data('disable-on')) ){
              if ( $(scrollbar).is('.ps') ){
                ps.destroy();
                ps = null;
              }
            } else {
              if ( $(scrollbar).not('.ps') ){
                initPS();
              }
            }
          }
        }

        checkMedia();
        _window.on('resize', debounce(checkMedia, 250));

      })
    }
  }


  ////////////
  // TELEPORT PLUGIN
  ////////////
  function initTeleport(){
    $('[js-teleport]').each(function (i, val) {
      var self = $(val)
      var objHtml = $(val).html();
      var target = $('[data-teleport-target=' + $(val).data('teleport-to') + ']');
      var conditionMedia = $(val).data('teleport-condition').substring(1);
      var conditionPosition = $(val).data('teleport-condition').substring(0, 1);

      if (target && objHtml && conditionPosition) {

        function teleport() {
          var condition;

          if (conditionPosition === "<") {
            condition = _window.width() < conditionMedia;
          } else if (conditionPosition === ">") {
            condition = _window.width() > conditionMedia;
          }

          if (condition) {
            target.html(objHtml)
            self.html('')
          } else {
            self.html(objHtml)
            target.html("")
          }
        }

        teleport();
        _window.on('resize', debounce(teleport, 100));


      }
    })
  }

  ////////////
  // UI
  ////////////

  // textarea autoExpand
  _document
    .one('focus.autoExpand', '.ui-group textarea', function(){
        var savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
    })
    .on('input.autoExpand', '.ui-group textarea', function(){
        var minRows = this.getAttribute('data-min-rows')|0, rows;
        this.rows = minRows;
        rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
        this.rows = minRows + rows;
    });

  // Masked input
  function initMasks(){
    $("[js-dateMask]").mask("99.99.99",{placeholder:"ДД.ММ.ГГ"});
    $("input[type='tel']").mask("+7 (000) 000-0000", {placeholder: "+7 (___) ___-____"});
  }

  // selectric
  function initSelectric(){
    var $select = $('[js-select]')
    if ( $select.length === 0 ) return

    $select.selectric({
      maxHeight: 300,
      arrowButtonMarkup: '<b class="button"><svg class="ico ico-select-down"><use xlink:href="img/sprite.svg#ico-select-down"></use></svg></b>',

      onInit: function(element, data){
        var $elm = $(element),
            $wrapper = $elm.closest('.' + data.classes.wrapper);

        $wrapper.find('.label').html($elm.attr('placeholder'));
      },
      onBeforeOpen: function(element, data){
        var $elm = $(element),
            $wrapper = $elm.closest('.' + data.classes.wrapper);

        $wrapper.find('.label').data('value', $wrapper.find('.label').html()).html($elm.attr('placeholder'));
      },
      onBeforeClose: function(element, data){
        var $elm = $(element),
            $wrapper = $elm.closest('.' + data.classes.wrapper);

        $wrapper.find('.label').html($wrapper.find('.label').data('value'));
      }
    });
  }

  ////////////
  // SCROLLMONITOR
  ////////////
  function initScrollMonitor(fromPjax){

    // REVEAL animations
    var $reveals = $('[js-reveal]');

    if ( $reveals.length > 0 ){
      var animatedClass = "is-animated";
      var pageTransitionTimeout = 500

      $('[js-reveal]').each(function(i, el){
        var type = $(el).data('type') || "enterViewport"

        // onload type
        if ( type === "onload" ){
          var interval = setInterval(function(){
            // if (!preloaderActive){
              if ( fromPjax ){
                // wait till transition overlay is fullyanimated
                setTimeout(function(){
                  $(el).addClass(animatedClass);
                  clearInterval(interval)
                }, pageTransitionTimeout)
              } else {
                $(el).addClass(animatedClass);
                clearInterval(interval)
              }
            // }
          }, 100)
          return
        }

        // halfy enter
        if ( type === "halflyEnterViewport"){
          var scrollListener = throttle(function(){
            var vScrollBottom = _window.scrollTop() + _window.height();
            var elTop = $(el).offset().top
            var triggerPoint = elTop + ( $(el).height() / 2)

            if ( vScrollBottom > triggerPoint ){
              $(el).addClass(animatedClass);
              window.removeEventListener('scroll', scrollListener, false); // clear debounce func
            }
          }, 100)

          window.addEventListener('scroll', scrollListener, false);
          return
        }

        // regular (default) type
        var elWatcher = scrollMonitor.create( $(el) );
        elWatcher.enterViewport(throttle(function() {
          $(el).addClass(animatedClass);
        }, 100, {
          'leading': true
        }));

      });

    }

  }

  ////////////////
  // FORM VALIDATIONS
  ////////////////

  // jQuery validate plugin
  // https://jqueryvalidation.org
  function initValidations(){
    // GENERIC FUNCTIONS
    var validateErrorPlacement = function(error, element) {
      error.addClass('ui-input__validation');
      error.appendTo(element.parent("div"));
    }
    var validateHighlight = function(element) {
      $(element).addClass("has-error");
    }
    var validateUnhighlight = function(element) {
      $(element).removeClass("has-error");
    }
    var validateSubmitHandler = function(form) {
      $(form).addClass('loading');
      $.ajax({
        type: "POST",
        url: $(form).attr('action'),
        data: $(form).serialize(),
        success: function(response) {
          $(form).removeClass('loading');
          var data = $.parseJSON(response);
          if (data.status == 'success') {
            // do something I can't test
          } else {
              $(form).find('[data-error]').html(data.message).show();
          }
        }
      });
    }

    var validatePhone = {
      required: true,
      normalizer: function(value) {
          var PHONE_MASK = '+X (XXX) XXX-XXXX';
          if (!value || value === PHONE_MASK) {
              return value;
          } else {
              return value.replace(/[^\d]/g, '');
          }
      },
      minlength: 11,
      digits: true
    }

    /////////////////////
    // REGISTRATION FORM
    ////////////////////
    $(".js-registration-form").validate({
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: validateSubmitHandler,
      rules: {
        last_name: "required",
        first_name: "required",
        email: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6,
        }
        // phone: validatePhone
      },
      messages: {
        last_name: "Заполните это поле",
        first_name: "Заполните это поле",
        email: {
            required: "Заполните это поле",
            email: "Email содержит неправильный формат"
        },
        password: {
            required: "Заполните это поле",
            email: "Пароль мимимум 6 символов"
        },
        // phone: {
        //     required: "Заполните это поле",
        //     minlength: "Введите корректный телефон"
        // }
      }
    });

    var subscriptionValidationObject = {
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: function(form) {
        var $form = $(form)
        $form.addClass('is-loading');
        var $email = $form.find('input[name="email"]')
        var emailValue = $email.val()

        // $.ajax({
        //   type: "POST",
        //   url: $(form).attr('action'),
        //   data: $(form).serialize(),
        //   success: function(response) {
        //     $(form).removeClass('is-loading');
        //     var data = $.parseJSON(response);
        //     if (data.status == 'success') {
        //       // do something I can't test
        //     } else {
        //         $(form).find('[data-error]').html(data.message).show();
        //     }
        //   }
        // });

        // append email to thank you message
        $('[js-subsc-thanks-message]').find('strong').text(emailValue)

        // open modal
        // var mfpThanksOptions = $.extend( defaultPopupOptions, {
        //   items: {src: '#subsc-thanks'}
        // }, true);
        // $.magnificPopup.open(mfpThanksOptions);
        //
        // $form.removeClass('is-loading');
        // $email.val("") // clear prev value

      },
      rules: {
        email: {
          required: true,
          email: true
        }
      },
      messages: {
        email: {
          required: "Заполните это поле",
          email: "Неверный формат email"
        }
      }
    }

    // call/init
    $("[js-validate-subscription]").validate(subscriptionValidationObject);
    $("[js-subscription-validation-footer]").validate(subscriptionValidationObject);
    $("[js-subscription-validation-menu]").validate(subscriptionValidationObject);
  }

  //////////
  // BARBA PJAX
  //////////

  Barba.Pjax.Dom.containerClass = "page";
  var transitionInitElement

  var FadeTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise
        .all([this.newContainerLoading, this.fadeOut()])
        .then(this.fadeIn.bind(this));
    },

    fadeOut: function() {
      var _this = this;
      var $oldPage = $(this.oldContainer)
      var $newPage = $(this.newContainer);
      var deferred = Barba.Utils.deferred();

      TweenLite.to($oldPage, .5, {
        opacity: 0,
        ease: Power1.easeIn,
        onComplete: function() {
          deferred.resolve();
        }
      });

      return deferred.promise
    },

    fadeIn: function() {
      var _this = this;
      var $oldPage = $(this.oldContainer)
      var $newPage = $(this.newContainer);

      $(this.oldContainer).hide();

      $newPage.css({
        visibility : 'visible',
        opacity : 0
      });

      TweenLite.to(window, .15, {
        scrollTo: {y: 0, autoKill: false},
        ease: easingSwing
      });

      TweenLite.to($newPage, .5, {
        opacity: 1,
        ease: Power1.easeOut,
        onComplete: function() {
          triggerBody()
          _this.done();
        }
      });

    }
  });

  // set barba transition
  Barba.Pjax.getTransition = function() {
    return FadeTransition;
    // if ( transitionInitElement ){
    //   if ( transitionInitElement.attr('data-transition') ){
    //     var transition = transitionInitElement.data('transition');
    //     // console.log(transition)
    //     // if ( transition === "project" ){
    //     //   return ProjectTransition
    //     // }
    //   }
    //   return FadeTransition;
    // } else {
    //   // first visit + back button (history is blank)
    //   window.location.href = Barba.HistoryManager.history[1].url
    // }
  };

  Barba.Prefetch.init();
  Barba.Pjax.start();

  // initialized transition
  Barba.Dispatcher.on('linkClicked', function(el) {
    transitionInitElement = el instanceof jQuery ? el : $(el)
  });

  // The new container has been loaded and injected in the wrapper.
  Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container, newPageRawHTML) {
    pageReady(true);
  });

  // The transition has just finished and the old Container has been removed from the DOM.
  Barba.Dispatcher.on('transitionCompleted', function(currentStatus, oldStatus) {
    pageCompleated(true);
  });

  // some plugins get bindings onNewPage only that way
  function triggerBody(){
    $(window).scroll();
    $(window).resize();
  }

  //////////
  // DEVELOPMENT HELPER
  //////////
  function setBreakpoint(){
    var wHost = window.location.host.toLowerCase()
    var displayCondition = wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0
    if (displayCondition){
      var wWidth = getWindowWidth();
      var wHeight = _window.height()

      var content = "<div class='dev-bp-debug'>"+wWidth+" x "+wHeight+"</div>";

      $('.page').append(content);
      setTimeout(function(){
        $('.dev-bp-debug').fadeOut();
      },1000);
      setTimeout(function(){
        $('.dev-bp-debug').remove();
      },1500)
    }
  }

});


// HELPERS and PROTOTYPE FUNCTIONS

// LINEAR NORMALIZATION
function normalize(value, fromMin, fromMax, toMin, toMax) {
  var pct = (value - fromMin) / (fromMax - fromMin);
  var normalized = pct * (toMax - toMin) + toMin;

  //Cap output to min/max
  if (normalized > toMax) return toMax;
  if (normalized < toMin) return toMin;
  return normalized;
}

// get window width (not to forget about ie, win, scrollbars, etc)
function getWindowWidth(){
  return window.innerWidth
}

// animate lazy class toggler
function animateLazy(element){
  var fadeTimeout = 250
  var $scaler = element.closest('.scaler')
  $scaler.addClass('is-loaded');

  if ( $scaler.length === 0 ){
    $(element).addClass('is-loaded')
  }

  if ( $scaler.is('.no-bg-onload') ){
    setTimeout(function(){
      $scaler.addClass('is-bg-hidden');
    }, fadeTimeout)
  }
}
