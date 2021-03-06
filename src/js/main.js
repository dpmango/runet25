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
    bottomPoint: undefined,
    colorControlSections: undefined
  }

  var browser = {
    isRetinaDisplay: isRetinaDisplay(),
    isIe: msieversion(),
    isMobile: isMobile()
  }
  window.browser = browser

  var sliders = {
    newsScroller: {
      instance: undefined
    },
    cardsScroller: {
      instance: undefined
    },
    timeline: {
      instance: undefined,
      disableLessThan: 576
    }
  } // collection of all sliders

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
      },
      close: function() {
        _window.scrollTop(startWindowScroll);
      }
    }
  }
  var stickyParams = {
    object: undefined,
    objectHeight: undefined,
    container: undefined,
    containerOffsetTop: undefined,
    containerWidth: undefined,
    footerOffset: undefined,
    windowHeight: undefined
  }

  ////////////
  // LIST OF FUNCTIONS
  ////////////

  // some functions should be called once only
  legacySupport();
  initaos();
  // preloaderDone();

  // The new container has been loaded and injected in the wrapper.
  function pageReady(fromPjax){
    closeMobileMenu(fromPjax);
    setLineBreaks();
    initSlidersResponsive();
    initPopups();
    getScalerResponsive();
    setScalerResponsive();
    initPerfectScrollbar();
    initMasks();
    initSelectric();
    initValidations();
    initTeleport();
    initDatepicker(fromPjax);
  }

  // Overlay transtion is covering the screen and starts to reveal
  function inBetweenTransition(fromPjax){
    getStickyParams(fromPjax);
    initStickyKit(fromPjax);
    getHeaderParams(fromPjax);
    controlHeaderColor();
  }

  // Overlay transition is about to be finnished
  function transitionIsAboutToEnd(fromPjax){
    initScrollMonitor(fromPjax);
    initAOSRefresher(fromPjax);
    if ( fromPjax ){
      AOS.refreshHard();
      window.onLoadTrigger()
    }
  }

  // The transition has just finished and the old Container has been removed from the DOM.
  function pageCompleated(fromPjax){
    if ( fromPjax ){
      // AOS.refreshHard();
      // window.onLoadTrigger()
    }
  }

  // some plugins work best with onload triggers
  window.onLoadTrigger = function onLoad(){
    initLazyLoad();
    preloaderDone();
  }

  // this is a master function which should have all functionality
  pageReady();
  inBetweenTransition();
  transitionIsAboutToEnd();
  pageCompleated();

  // scroll/resize listeners
  _window.on('scroll', getWindowScroll);
  _window.on('scroll', scrollHeader);
  _window.on('scroll', controlHeaderColor);
  _window.on('scroll', scrollSticky);
  _window.on('resize', debounce(getHeaderParams, 100))
  _window.on('resize', debounce(setScalerResponsive, 100))
  _window.on('resize', debounce(initSlidersResponsive, 100))
  _window.on('resize', debounce(getStickyParams, 100))
  _window.on('resize', debounce(monitorStickyResize, 100))
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
    // window.viewportUnitsBuggyfill.init({
    //   force: false,
    //   refreshDebounceWait: 150,
    //   appendToBody: true
    // });

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

  function getCorrespondingPage(fromPjax){
    var $page = $('.page');
    if ( fromPjax ){ $page = $page.last() }
    return $page
  }

  ////////////////
  // HEADER SCROLL
  ////////////////
  function getHeaderParams(fromPjax){
    var $header = $('.header')
    var headerWrapperTranslate = 0
    var headerHeight = $header.outerHeight() + headerWrapperTranslate
    var $page = getCorrespondingPage(fromPjax)
    var $colorControlSections = $page.find('[js-header-color]');
    var isHeaderSticky = $page.find('[js-header-sticky]').length > 0

    if ( isHeaderSticky ){
      $header.addClass('is-sticky')
    } else {
      $header.removeClass('is-sticky')
    }

    header = {
      container: $header,
      bottomPoint: headerHeight,
      colorControlSections: $colorControlSections,
      isHeaderSticky: isHeaderSticky
    }
  }

  function scrollHeader(){
    if ( header.container !== undefined ){
      var fixedClass = 'is-fixed';
      var visibleClass = 'is-fixed-visible';

      if ( header.isHeaderSticky ) return

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

  function controlHeaderColor(fromPjax){
    // Collect arr of past scroll elements
    var cur = header.colorControlSections.map(function(){
      var elTop = $(this).offset().top - parseInt($(this).css('marginTop'))
      if (elTop < scroll.y + (header.bottomPoint / 2)){
        return this
      }
    });

    // Get current element
    cur = $(cur[cur.length-1]);
    var headerMenuColor = cur && cur.length ? cur.data('menu-color') : ""
    var headerLogoColor = cur && cur.length ? cur.data('logo-color') : ""

    if ( !headerMenuColor ){
      $('.header').removeClass('is-menu-white')
    }
    if ( !headerLogoColor ){
      $('.header').removeClass('is-logo-white')
    }

    if ( headerMenuColor === "white" ){
      $('.header').addClass('is-menu-white')
    }

    if ( headerLogoColor === "white" ) {
      $('.header').addClass('is-logo-white')
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

  _document.on('click', '[js-form-events-toggle]', function(){
    var container = $('[js-form-events]'),
        form = $('.tile__form-events'),
        link = $(this);

    if (!container.hasClass('is-active')) {
      container.addClass('is-active');
      link.html('Скрыть форму');
      if (getWindowWidth() <= 992) {
        form.slideDown(200);
      }
    } else {
      container.removeClass('is-active');
      link.html('Показать форму');
      if (getWindowWidth() <= 992) {
        form.slideUp(200);
      }
    }
  });

  _document.on('click', '[js-tabs-nav] a', function() {
    $(this).parent().addClass('active').siblings().removeClass('active');
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
    .on('click', '.tile__cta', function(e){
      e.stopPropagation();
    })

  // converts .rtxt__wrap to multiple .rtxt__mover
  function setLineBreaks(){
    var $containers = $('[js-wrap-words]');
    if ( $containers.length === 0 ) return

    $containers.each(function(i, container){
      var $container = $(container);
      var containerText
      if ( $container.data("originText") !== undefined ){
        containerText = $container.data("originText")
      } else {
        containerText = $container.text();
        $container.data("originText", containerText)
      }
      wrapEachWord($container, containerText)
    })
  }

  //////////
  // STICKY TILE
  //////////
  function getStickyParams(fromPjax){
    var $page = getCorrespondingPage(fromPjax);
    var $obj = $page.find('[js-tile-fixed]').first(); // TODO - any case when there are multiple items on page?
    if ($obj.length === 0) return
    var $parent = $obj.parent();
    var useSelfWidth = $obj.data("use-self-width") !== undefined
    stickyParams = {
      object: $obj,
      objectHeight: $obj.outerHeight(),
      container: $parent,
      containerOffsetTop: $parent.offset().top,
      containerWidth: useSelfWidth ? $obj.outerWidth() : $parent.outerWidth(),
      footerOffset: $page.find('.footer').offset().top,
      windowHeight: _window.height()
    }
    scrollSticky();
  }

  function scrollSticky() {
    if ( !stickyParams.object ) return

    var tile = stickyParams.object
        wrapper = stickyParams.container

    if (scroll.y >= stickyParams.containerOffsetTop && getWindowWidth() > 992) {
      if (scroll.y + stickyParams.objectHeight >= stickyParams.footerOffset) {
        tile.css({
          top: 'auto',
          bottom: Math.round(scroll.y + stickyParams.windowHeight - stickyParams.footerOffset)
        });
      } else {
        tile.css({
          position: 'fixed',
          top: 0,
          width: stickyParams.containerWidth
        });
      }
    } else {
      tile.removeAttr('style');
    }
  }

  //////////
  // STICKY KIT
  //////////
  function initStickyKit(fromPjax){
    var $page = getCorrespondingPage(fromPjax);
    var $sticky = $page.find('[js-sticky]');
    if ($sticky.length === 0) return

    $sticky.each(function(i, sticky){
      enableSticky(sticky)
    })
  }

  function enableSticky(sticky){
    var bp = $(sticky).data('disable-on');
    if ( bp && ( getWindowWidth() > parseInt(bp) ) ){
      // http://leafo.net/sticky-kit/
      $(sticky).stick_in_parent({
        inner_scrolling: true
      })
    }
  }

  function monitorStickyResize(){
    var $sticky = $('[js-sticky]');
    if ($sticky.length === 0) return

    $sticky.each(function(i, sticky){
      var bp = $(sticky).data('disable-on');
      if ( bp && ( getWindowWidth() <= parseInt(bp) ) ){
        $(sticky).trigger("sticky_kit:detach");
      } else {
        enableSticky(sticky)
      }
    })
  }


  /**********
  * PLUGINS *
  **********/

  //////////
  // SLIDERS
  //////////
  function initSliders(){
    // no regular slides yet
  }

  function initSlidersResponsive(){
    // RESPONSIVE ON/OFF sliders
    var newsScrollerSwiperSelector = '[js-swiper-news-scroller]';
    var cardsScrollerSwiperSelector = '[js-swiper-cards-scroller]';
    var timelineSwiperSelector = '[js-timeline-slider]';
    var tabsNavSwiperSelector = '[js-tabs-nav-slider]';

    initNewsScrollerSwiper();
    initCardsScrollerSwiper();
    iniTabsNavSwiper();

    if ( $(timelineSwiperSelector).length > 0 ){
      if ( getWindowWidth() <= sliders.timeline.disableLessThan ) {
        if ( sliders.timeline.instance !== undefined ) {
          console.log('dest')
          sliders.timeline.instance.destroy( true, true );
          sliders.timeline.instance = undefined
        }
        // return
      } else {
        if ( sliders.timeline.instance === undefined ) {
          initTimelineSwiper();
        }
      }
    }

    // INIT options

    // news scroller swiper
    function initNewsScrollerSwiper(){
      sliders.newsScroller.instance = new Swiper(newsScrollerSwiperSelector, {
        wrapperClass: "swiper-wrapper",
        slideClass: "year-stack",
        direction: 'horizontal',
        loop: false,
        watchOverflow: true,
        setWrapperSize: false,
        spaceBetween: 0,
        slidesPerView: 'auto',
        normalizeSlideIndex: true,
        freeMode: true,
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
          dragSize: 36
        },
        breakpoints: {
          575: {
            slidesPerView: 1,
            freeMode: false,
            scrollbar: false,
            // autoHeight: true,
            navigation: {
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next'
            }
          }
        }
      })
    }

    // card scroller swiper
    function initCardsScrollerSwiper(){
      sliders.cardsScroller.instance = new Swiper(cardsScrollerSwiperSelector, {
        wrapperClass: "swiper-wrapper",
        slideClass: "card",
        direction: 'horizontal',
        loop: false,
        watchOverflow: true,
        setWrapperSize: false,
        spaceBetween: 0,
        slidesPerView: 'auto',
        normalizeSlideIndex: true,
        freeMode: true,
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
          dragSize: 36
        },
        breakpoints: {
          575: {
            slidesPerView: 1,
            freeMode: false,
            scrollbar: false,
            // autoHeight: true,
            navigation: {
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next'
            }
          }
        }
      })
    }

    // news scroller swiper
    function iniTabsNavSwiper(){
      sliders.newsScroller.instance = new Swiper(tabsNavSwiperSelector, {
        loop: false,
        watchOverflow: true,
        setWrapperSize: false,
        spaceBetween: 0,
        slidesPerView: 'auto',
        normalizeSlideIndex: true,
        freeMode: true,
      });
    }

    // TIMELINE
    function initTimelineSwiper(){
      sliders.timeline.instance = new Swiper(timelineSwiperSelector, {
        slidesPerView: 'auto',
        direction: 'vertical',
        freeMode: true,
        resistanceRatio: 0,
        // freeModeSticky: true,
        mousewheel: {
          eventsTarged: 'container',
          releaseOnEdges: true
        }
      });
    }

  }



// function getProductSwiperInstance(that){
//   var swiperId = $(that).closest('.swiper-container').data("id")
//   var swiperInstance
//   $.each(sliders.productImages, function(i,s){
//     if ( s.id === swiperId ){
//       swiperInstance = s.instance
//     }
//   })
//   return swiperInstance
// }



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
        getStickyParams();
        ieFixPictures()
      }
    });

  }

  function ieFixPictures(){
    if ( window.browser.isIe ){
      // ie pollyfils
      picturefill();
      objectFitImages();
      // window.fitie.init()
    }
  }

  window.ieFixPictures = ieFixPictures


  ///////////////
  // resize scaler
  ///////////////
  function getScalerResponsive(){
    var $images = $('[js-scaler-mobile]');
    if ( $images.length > 0 ){
      $images.each(function(i, img){
        var $img = $(img);
        var desktopArPx = $img.css('padding-bottom');
        var imgWidth = $img.width()
        var dekstopArPercent = (desktopArPx.slice(0, -2) / imgWidth) * 100 + '%';
        // save desktop ar value in %
        $img.attr('data-ar-desktop', dekstopArPercent)
      });
    }
  }

  function setScalerResponsive(){
    var $images = $('[js-scaler-mobile]');

    if ( $images.length > 0 ){
      var wWidth = getWindowWidth();
      $images.each(function(i, img){
        var $img = $(img);
        var mobileAr = $img.data('ar-768');
        var desktopAr = $img.data('ar-desktop')

        if ( mobileAr ){
          if ( wWidth <= 768 ){
            $img.css({'padding-bottom': setAr(mobileAr)})
          } else {
            $img.css({'padding-bottom': setAr(desktopAr)})
          }
        }
      })
    }
  }

  function setAr(ar){
    // please also check _media.sass for possible values
    if ( ar === "1:1" ){
      return "100%"
    } else if ( ar === "16:9" ){
      return "56.25%"
    } else if ( ar === "4:3" ){
      return "75%"
    } else if ( ar === "21:9" ){
      return "42.85%"
    } else {
      var arAsWidthHeight = ar.split('/')
      if ( arAsWidthHeight.length === 2 ){
        return (parseInt(arAsWidthHeight[0])/parseInt(arAsWidthHeight[1]) * 100) + "%"
      }
    }

    return ar
  }


  ////////////
  // SCROLLBAR
  ////////////
  function initPerfectScrollbar(){
    if ( $('[js-scrollbar]').length > 0 ){
      $('[js-scrollbar]').each(function(i, scrollbar){
        var ps;

        function initPS(){
          var yDisabled = $(scrollbar).data('y-disabled') == true
          var xDisabled = $(scrollbar).data('x-disabled') == true
          var wheelPropagation = $(scrollbar).data('wheel-propagation') !== undefined ? $(scrollbar).data('wheel-propagation') : true
          // console.log(wheelPropagation)
          ps = new PerfectScrollbar(scrollbar, {
            suppressScrollY: yDisabled,
            suppressScrollX: xDisabled,
            // wheelSpeed: 2,
            wheelPropagation: wheelPropagation,
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
      var conditionMedia = parseInt($(val).data('teleport-condition').substring(1));
      var conditionPosition = $(val).data('teleport-condition').substring(0, 1);

      if (target && objHtml && conditionPosition) {

        function teleport() {
          var condition;

          if (conditionPosition === "<") {

            condition = getWindowWidth() < (conditionMedia + 1);
          } else if (conditionPosition === ">") {
            condition = getWindowWidth() > conditionMedia;
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
  // AIR DATEPICKER PLUGIN
  ////////////
  function initDatepicker(fromPjax) {
    var $page = getCorrespondingPage(fromPjax)
    var $input = $page.find('[js-datepicker]')

    if ( $input.length === 0 ) return

    var datepicker = $input.datepicker({
      showEvent: 'none',
      autoClose: true
    }).data('datepicker');

    _document.on('click', '[js-datepicker-toggle]', function(){
      datepicker.show();
    });
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
        var delay = $(el).data('delay') || 1

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
            var triggerPoint = elTop + ( $(el).outerHeight() / 2)

            if ( vScrollBottom > triggerPoint ){
              $(el).addClass(animatedClass);
              window.removeEventListener('scroll', scrollListener, false); // clear debounce func
            }
          }, 100)

          window.addEventListener('scroll', scrollListener, false);
          return
        }

        // regular (default) type
        var $containerWatcher = $(el).closest('[data-scrollmonitor-container]')
        var elWatcher

        if ( $containerWatcher.length > 0 ){
          // this containerMonitor is an instance of the scroll monitor that listens to scroll events on your container.
          var containerMonitor = scrollMonitor.createContainer($containerWatcher);
          elWatcher = containerMonitor.create($(el));
        } else {
          elWatcher = scrollMonitor.create( $(el) );
        }

        elWatcher.enterViewport(throttle(function() {
          setTimeout(function(){
            $(el).addClass(animatedClass);
          }, parseInt(delay))
        }, 100, {
          'leading': true
        }));

      });
    }
  }

  // update states for AOS on overflow scroll containers
  function initAOSRefresher(fromPjax){
    var $page = getCorrespondingPage(fromPjax)
    var $scrollable = $page.find('[js-scrollable-animation-fix]');

    $scrollable.on('scroll', throttle(function(){
      AOS.refresh()
    }, 100))
  }


  ////////////////
  // FORM VALIDATIONS
  ////////////////

  // jQuery validate plugin
  // https://jqueryvalidation.org
  function initValidations(){
    // globals
    var subscriptionValidation, feedbackValidation;

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
    // $(".js-registration-form").validate({
    //   errorPlacement: validateErrorPlacement,
    //   highlight: validateHighlight,
    //   unhighlight: validateUnhighlight,
    //   submitHandler: validateSubmitHandler,
    //   rules: {
    //     last_name: "required",
    //     first_name: "required",
    //     email: {
    //       required: true,
    //       email: true
    //     },
    //     password: {
    //       required: true,
    //       minlength: 6,
    //     }
    //     // phone: validatePhone
    //   },
    //   messages: {
    //     last_name: "Заполните это поле",
    //     first_name: "Заполните это поле",
    //     email: {
    //         required: "Заполните это поле",
    //         email: "Email содержит неправильный формат"
    //     },
    //     password: {
    //         required: "Заполните это поле",
    //         email: "Пароль мимимум 6 символов"
    //     },
    //     // phone: {
    //     //     required: "Заполните это поле",
    //     //     minlength: "Введите корректный телефон"
    //     // }
    //   }
    // });

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
        var mfpThanksOptions = $.extend( defaultPopupOptions, {
          items: {src: '#subsc-thanks'}
        }, true);
        $.magnificPopup.open(mfpThanksOptions);

        $form.removeClass('is-loading');
        $email.val("") // clear prev value
        subscriptionValidation.resetForm();
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
    subscriptionValidation = $("[js-validate-subscription]").validate(subscriptionValidationObject);

    // prevent default submiting form through enter keypress
    _document.on("keyup", "[js-validate-subscription] input", function(e){
      if (e.keyCode == 13) {
        e.preventDefault()
      }
    })


    var feedbackValidationObject = {
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: function(form) {
        var $form = $(form)
        $form.addClass('is-loading');

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

        // open modal
        var mfpThanksOptions = $.extend( defaultPopupOptions, {
          items: {src: '#feedback-thanks'}
        }, true);
        $.magnificPopup.open(mfpThanksOptions);

        $form.removeClass('is-loading');
        $form.find('input, textarea').val('');
        feedbackValidation.resetForm();
      },
      rules: {
        name: {
          required: true
        },
        project: {
          required: true
        },
        text: {
          required: true
        }
      },
      messages: {
        name: {
          required: "Заполните это поле"
        },
        project: {
          required: "Заполните это поле"
        },
        text: {
          required: "Заполните это поле"
        }
      }
    }

    // call/init
    feedbackValidation = $("[js-validate-feedback]").validate(feedbackValidationObject);

    // prevent default submiting form through enter keypress
    _document.on("keyup", "[js-validate-feedback] input", function(e){
      if (e.keyCode == 13) {
        e.preventDefault()
      }
    });


    var eventValidationObject = {
      errorPlacement: validateErrorPlacement,
      highlight: validateHighlight,
      unhighlight: validateUnhighlight,
      submitHandler: function(form) {
        var $form = $(form)
        $form.addClass('is-loading');

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

        // open modal
        var mfpThanksOptions = $.extend( defaultPopupOptions, {
          items: {src: '#event-thanks'}
        }, true);
        $.magnificPopup.open(mfpThanksOptions);

        $form.removeClass('is-loading');
        $form.find('input, textarea').val('');
        eventValidation.resetForm();
      },
      rules: {
        name: {
          required: true
        },
        title: {
          required: true
        },
        terms: {
          required: true
        },
        initiators: {
          required: true
        },
        description: {
          required: true
        },
        essence: {
          required: true
        }
      },
      messages: {
        name: {
          required: "Заполните это поле"
        },
        title: {
          required: "Заполните это поле"
        },
        terms: {
          required: "Заполните это поле"
        },
        initiators: {
          required: "Заполните это поле"
        },
        description: {
          required: "Заполните это поле"
        },
        essence: {
          required: "Заполните это поле"
        }
      }
    }

    // call/init
    eventValidation = $("[js-validate-event]").validate(eventValidationObject);

    // prevent default submiting form through enter keypress
    _document.on("keyup", "[js-validate-event] input", function(e){
      if (e.keyCode == 13) {
        e.preventDefault()
      }
    })
  }



  //////////
  // BARBA PJAX
  //////////

  Barba.Pjax.Dom.containerClass = "page";
  var transitionInitElement

  var OverlayTransition = Barba.BaseTransition.extend({
    start: function() {
      Promise.all([this.newContainerLoading, this.fadeOut()]).then(
        this.fadeIn.bind(this)
      );
    },

    fadeOut: function() {
      var deferred = Barba.Utils.deferred();
      var _this = this;

      // store overlay globally to access in fadein
      this.$overlayBlue = $('<div class="js-transition-overlay-blue"></div>');
      this.$overlayRed = $('<div class="js-transition-overlay-red"></div>');
      this.$overlayBlue.insertAfter("body");
      this.$overlayRed.insertAfter("body");
      $("body").addClass("is-transitioning");

      // red moves first to the right
      TweenLite.fromTo(this.$overlayRed, 0.45,
        {x: "0%"}, {x: "100%", ease: Power2.easeIn}
      );

      TweenLite.fromTo(this.$overlayBlue, 0.6,
        {x: "0%"},
        {
          x: "100%",
          ease: Quart.easeIn,
          onComplete: function() {
            _this.$overlayRed.remove();
            deferred.resolve();
          }
        }
      );

      return deferred.promise;
    },

    fadeIn: function() {
      var _this = this; // copy to acces inside animation callbacks
      var $el = $(this.newContainer);

      $(this.oldContainer).hide();

      inBetweenTransition(true)

      $el.css({
        visibility: "visible"
      });

      TweenLite.to(window, .15, {
        scrollTo: {y: 0, autoKill: false},
        ease: easingSwing
      });

      setTimeout(function(){
        transitionIsAboutToEnd(true)
      }, 400)

      TweenLite.fromTo(
        this.$overlayBlue,
        1,
        {
          x: "100%",
          overwrite: "all"
        },
        {
          x: "200%",
          ease: Expo.easeOut,
          delay: 0.2,
          onComplete: function() {
            _this.$overlayBlue.remove();
            triggerBody();
            $("body").removeClass("is-transitioning");
            _this.done();
          }
        }
      );
    }
  });

  // set barba transition
  Barba.Pjax.getTransition = function() {
    return OverlayTransition;
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

// get window width (not to forget about ie, win, scrollbars, etc)
function getWindowWidth(){
  return window.innerWidth
}

// JQUERY CUSTOM HELPER FUNCTIONS
function wrapEachWord($el, content){
  var text_arr = content.split(' ');

  for (i = 0; i < text_arr.length; i++) {
    text_arr[i] = '<span class="rtxt__wrap"><span class="rtxt__mover">' + text_arr[i] + '&nbsp;</span></span>';
  }

  $el.html(text_arr.join(''));

  $el.addClass('is-words-wrapped')
}
