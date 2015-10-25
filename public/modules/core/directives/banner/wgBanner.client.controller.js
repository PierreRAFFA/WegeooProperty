'use strict';

(function(angular)
{
    var TweenMax = window.TweenMax;
    var Cubic = window.Cubic;

    function BannerController($scope,$element,$swipe)
    {
        this.$scope = $scope;

        /**
         * HTML Element
         */
        this.$element = $element;

        /**
         * Images to display in the banner
         * @type {Array} bind
         */
        this.provider = [];

        /**
         * Title to display
         * @type {string} bind
         */
        this.title = '';

        /**
         * Options of the banner
         *      animationDuration: animation duration in ms
         *      delay: delay between each images in ms
         *      gutter: gutter between each images in px
         *
         * @type {Array}
         */
        this.options = {
            delay : 3000,
            animationDuration : 500,
            gutter : 10
        };

        /**
         * Main Container
         * @type {null}
         */
        this.$bannerContainer = null;

        /**
         * Image Container
         * @type {null}
         */
        this.$imageContainer = null;

        /**
         * Timer for the animation
         * @type {null}
         */
        this.interval = null;

        /**
         * Current Image Index
         * @type {number}
         */
        this.currentImageIndex = 0;

        this.leftOffset = 0;
        this.rightOffset = 0;

        /**
         * Sepcifies whether the animation is running
         * @type {boolean}
         */
        this.isRunning = false;

        this.queue = [];

        this.displayedImages = {};

        this.isQueueLaunched = false;

        //listen to new provider
        var vm = this;
        var self = this;
        $scope.$watch('vm.provider',
            function ( newValue, oldValue ) {

                console.log( 'vm.provider:', newValue );
                console.log( 'provider:', self.provider );
                self.displayImages();
            }
        );

        var mouseStartX = 0;
        var imageContainerLeft = 0;
        var lastXFromMove = 0;
        var inertia = 0;
        var tween = null;
        var timeout = null;

        //launch animation
        clearTimeout(timeout);
        timeout = setTimeout(function()
        {
            self._animate();
        }, 2000);

        //bind swipe events
        $swipe.bind($element, {
            'start': function(coords) {
                mouseStartX = coords.x;
                imageContainerLeft = self.$imageContainer.position().left;
                self.stop();

                if ( tween)
                    tween.kill();

            },
            'move': function(coords) {
                var delta = coords.x - mouseStartX;

                inertia = coords.x - lastXFromMove;
                self.$imageContainer.css('left' , imageContainerLeft + delta);
                lastXFromMove = coords.x;

                //compute current index
                self.defineCurrentImageIndex(inertia);


            },
            'end': function(coords) {

                //animate with inertia
                self._loadImagesAround();

                console.log('current:'+self.$imageContainer.css('left'));
                var finalX = parseFloat(self.$imageContainer.css('left')) + inertia * 10;
                console.log('next:' + finalX);
                finalX += 'px';
                tween = TweenMax.to(self.$imageContainer, 1, {left:finalX, ease: Cubic.easeOut , onUpdate: function()
                {
                    console.log('onUpdate');

                    self.defineCurrentImageIndex(inertia);

                    self._loadImagesAround();
                }});

                clearTimeout(timeout);
                timeout = setTimeout(function()
                {
                    self._animate();

                    self.defineCurrentImageIndex(inertia);



                }, 2000);

            },
            'cancel': function(coords) {
            }
        });
    }

    BannerController.prototype.defineCurrentImageIndex = function(inertia)
    {
        var currentImageLeft = this.displayedImages['image_'+ (this.currentImageIndex)];
        var relativeX = currentImageLeft  + this.$imageContainer.position().left;
        if ( inertia > 0)
        {
            if ( relativeX > 0  )
            {
                this.currentImageIndex--;
                console.log('currentImageIndex:' + this.currentImageIndex);
            }
        }else{
            if ( relativeX < 0  )
            {
                this.currentImageIndex++;
                console.log('currentImageIndex:' + this.currentImageIndex);
            }

        }
    };

    BannerController.prototype.displayImages = function()
    {
        this._destroyImageContainer();

        this._createImageContainer();

        this._loadImagesAround();
    };
    BannerController.prototype._destroyImageContainer = function()
    {
        if (this.$imageContainer)
        {
            this.$imageContainer.remove();
            this.$imageContainer = null;

            this.currentImageIndex = 0;
            this.leftOffset = 0;
            this.rightOffset = 0;
            this.displayedImages = {};
        }

    };
    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////  CREATE CONTAINER
    BannerController.prototype._createImageContainer = function()
    {
        if ( this.$imageContainer === null)
        {
            this.$bannerContainer = this.$element.find('.bannerContainer');

            this.$imageContainer = angular.element('<div style="position:relative;height:100%;left:0;white-space: nowrap;"></div>');
            this.$bannerContainer.append(this.$imageContainer);
        }
    };

    BannerController.prototype._loadImagesAround = function()
    {
        if ( this.provider.length === 0) return;

        this.queue = [];
        for(var i = 0 ; i < 6 ; i++)
        {
            var image = null;
            var providerImageIndex;

            var imageIndex = this.currentImageIndex + i;
            if (this.displayedImages.hasOwnProperty('image_'+ imageIndex) === false)
            {

                if ( imageIndex >= 0)
                {
                    providerImageIndex = imageIndex % this.provider.length;
                }else{
                    providerImageIndex = this.provider.length + imageIndex % this.provider.length;
                }

                image = this.provider[providerImageIndex];
                this.queue.push({
                    image:image,
                    position:'right',
                    index:imageIndex
                });
            }

            imageIndex = this.currentImageIndex - i;
            if (this.displayedImages.hasOwnProperty('image_'+ imageIndex) === false)
            {
                if ( imageIndex >= 0)
                {
                    providerImageIndex = imageIndex % this.provider.length;
                }else{
                    providerImageIndex = (this.provider.length-1) + imageIndex % this.provider.length;
                }


                image = this.provider[providerImageIndex];
                this.queue.push({
                    image:image,
                    position:'left',
                    index:imageIndex
                });
            }
        }

        if ( this.isQueueLaunched === false)
        {
            this.isQueueLaunched = true;
            this._loadNextImage();
        }
    };
    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////  LOAD
    BannerController.prototype._loadNextImage = function()
    {
        //console.log('_loadNextImage');
        if ( this.queue.length)
        {
            //get next Image URL
            var imageInfos = this.queue.shift();
            var image = imageInfos.image;
            var position = imageInfos.position;
            var imageIndex = imageInfos.index;

            if ( this.displayedImages.hasOwnProperty('image_' + imageIndex) === false)
            {
                //load next image
                this._loadImage(image,position,imageIndex);
            }else{
                this._loadNextImage();
            }

        }else{
            this.isQueueLaunched = false;
        }
    };

    BannerController.prototype._loadImage = function(image,position,imageIndex)
    {
        window.p = this.provider;

        var self = this;

        //get Src
        var imageURL   = image.src;
        //get Href
        var imageHref  = image.href;
        //get width
        var imageWidth = image.width;
        //get height
        var imageHeight= image.height;
        //get caption
        var imageCaption = image.caption;
        
        if ( imageWidth && imageHeight)
        {
            self._loadImageWithSize(imageURL,imageHref,imageWidth,imageHeight,imageCaption,position,imageIndex);
        }else{
            //Load image
            var imageToLoad = new Image();
            imageToLoad.src = imageURL;
            imageToLoad.onload = function()
            {
                image.width = this.width;
                image.height = this.height;
                self._loadImageWithSize(imageURL,imageHref,this.width,this.height,imageCaption,position,imageIndex);
            };
            imageToLoad.onerror = function()
            {
                self._loadImage('/modules/core/img/defaultPreviewClassifiedPhoto218.jpg',imageHref, null, null,imageCaption,position);
            };
        }
    };

    BannerController.prototype._loadImageWithSize = function(imageURL,href,width,height,caption,position,imageIndex)
    {
        //get size
        var imageW = width;
        var imageH = height;

        //compute size
        var imageWidth = parseInt(this.$bannerContainer.height() * imageW / imageH);
        var imageHeight = this.$bannerContainer.height();

        var left;
        if ( position === 'right')
        {
            left = this.leftOffset;
        }else if ( position === 'left'){
            left = this.rightOffset - imageWidth - this.options.gutter;
        }

        this.displayedImages['image_' + imageIndex] = left;
        window.d = this.displayedImages;

        // a CSS
        var aCss = '';
        aCss += 'position:absolute;';
        aCss += 'overflow:hidden;';
        aCss += 'left:' + left + 'px;';
        aCss += 'width:' + imageWidth + 'px;';
        aCss += 'height:' + imageHeight + 'px;';

        var divCss = '';
        divCss += 'position:absolute;';
        divCss += 'background:#424242;';
        divCss += 'opacity:0.7;';
        divCss += 'width:100%;';
        divCss += 'height:40px;';
        divCss += 'bottom:0px;';
        divCss += 'color:#FFFFFF;';
        divCss += 'padding:3px;';
        divCss += 'font:1em FuturaStd-Light;';

        //image CSS
        var imageCSS = '';
        imageCSS += 'width:' + imageWidth + 'px;';
        imageCSS += 'height:' + imageHeight + 'px;';

        //append Image
        var imageHTMLString = '<a style="' + aCss + '" href="' + href + '" target="_blank">' + '<div style="' + divCss + '">' + caption + '</div>' + '<img style="' + imageCSS + '" src="' + imageURL + '"></img></a>';
        imageHTMLString = '<a style="' + aCss + '" target="_blank">' + '<div style="' + divCss + '">' + caption + '</div>' + '<img style="' + imageCSS + '" src="' + imageURL + '"></img></a>';
        this.$imageContainer.append(imageHTMLString);

        //increment this.leftOffset
        if ( position === 'right')
        {
            this.leftOffset += imageWidth + this.options.gutter;
        }else if ( position === 'left'){
            this.rightOffset -= imageWidth + this.options.gutter;
        }

        //load next image
        this._loadNextImage();
    };
    //////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////  ANIMATION
    BannerController.prototype._animate = function()
    {
        if (this.isRunning === false) {
            this.isRunning = true;
            this.interval = setInterval(this._onAnimate.bind(this), this.options.delay);
        }
    };
    BannerController.prototype._onAnimate = function()
    {
        var self = this;

        var nextImageLeft = this.displayedImages['image_' +  (this.currentImageIndex+1)];

        this.$imageContainer.animate({
            left : nextImageLeft*-1 + 'px'
        }, this.options.animationDuration, function()
        {
            self.currentImageIndex++;

            self._loadImagesAround();
        });
    };
    BannerController.prototype.stop = function()
    {
        clearInterval(this.interval);
        this.isRunning = false;
    };


    BannerController.prototype.test = function()
    {
        console.log('ok');
    };



    BannerController.$inject = ['$scope', '$element', '$swipe'];
    angular.module('core').controller('BannerController', BannerController);
})(angular);

