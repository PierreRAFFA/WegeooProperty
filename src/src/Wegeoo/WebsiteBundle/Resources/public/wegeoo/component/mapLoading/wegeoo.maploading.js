/*
 * Animated mapLoading 0.1
 *
 * Copyright 2014, Pierre RAFFA
 * Wegeoo.com
 * http://www.wegeoo.com/
 *
*/
(function($)
{
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CONTRUCTOR
    /**
     * mapLoading Object
     * @param {jQuery} $pElement jQuery object with one input tag
     * @param {Object=} pOptions Settings
     * @constructor
     */
    $.mapLoading = function($pElement, pOptions)
    {
        this.mElement = $pElement;

        this.mOptions = pOptions;

        this.mImages  = [];

        this.mRunning = false;

        /**
         * Assert parameters
         */
        if (!$pElement || !( $pElement instanceof jQuery) || $pElement.length !== 1 || $pElement.get(0).tagName.toUpperCase() !== 'DIV') {
            alert('Invalid parameter for jquery.mapLoading, jQuery object with one element with INPUT tag expected');
            return;
        }

        //init component
        this.render();
    };
    
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CREATE IMAGE CONTAINER
    $.mapLoading.prototype.render = function()
    {
        this.mImageContainer = $('<div style="position:relative;height:100%;left:0;white-space: nowrap;"></div>');
        this.mElement.append(this.mImageContainer);
    };
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// DISPLAY IMAGES
    /**
     *
     * @param pImages Array of URL
     * @param reset Boolean specifies if the banner have to be cleaned
     */
    $.mapLoading.prototype.displayImages = function(pImages, reset)
    {
        var lThis = this;

        if ( reset == true)
        {
            this.mImageContainer.empty();
            this.mImages = [];
        }
        
        //add images in this.mImages
        $.each(pImages , function(i, val)
        { 
            lThis.mImages.push(val);
        });
        
        if ( this.mRunning == false)
            this.loadNextImage();
    };
    
    $.mapLoading.prototype.loadImages = function()
    {
        this.loadNextImage();
    };
    $.mapLoading.prototype.loadNextImage = function()
    {
        if ( this.mImages.length == 0) return;

        //increment CurrentIndex
        this.mCurrentIndex++;

        //check index limit
        if (this.mCurrentIndex >= this.mImages.length)
            this.mCurrentIndex = 0;

        //check if container is not totally filled
        var lImageListWidth = this.mImageContainer.position().left + this.mLeftOffset;
        if (lImageListWidth < this.mElement.width() + 200)
        {
            //get next Image URL
            var lNextImageInfos = this.mImages[this.mCurrentIndex];

            //get Src
            var lNextImageURL   = lNextImageInfos.src;
            //get Href
            var lNextImageHref  = lNextImageInfos.href;
            //get width
            var lNextImageWidth = lNextImageInfos.width;
            //get height
            var lNextImageHeight= lNextImageInfos.height;
            //get caption
            var lNextImageCaption = lNextImageInfos.caption;

            //load next image
            this.loadImage(lNextImageURL,lNextImageHref,lNextImageWidth,lNextImageHeight,lNextImageCaption);
        } else {
            //launch animation
            this.animate();
        }

    };
    $.mapLoading.prototype.loadImage = function(pImageURL,pHref,pWidth,pHeight,caption)
    {
        var lThis = this;
    
        if ( pWidth && pHeight)
        {
             lThis.loadImageFromSize(pImageURL,pHref,pWidth,pHeight,caption);
        }else{
            //Load image
            var lImage = new Image();
            lImage.src = pImageURL;
            lImage.onload = function()
            {
                lThis.loadImageFromSize(pImageURL,pHref,this.width,this.height,caption);
            };
        }
    };
    $.mapLoading.prototype.loadImageFromSize = function(pImageURL,pHref,pWidth,pHeight,caption)
    {
        //get size
        var lImageW = pWidth;
        var lImageH = pHeight;

        //compute size
        var lImageWidth = parseInt(this.mElement.height() * lImageW / lImageH);
        var lImageHeight = this.mElement.height();
        
        // a CSS
        var lACss = "";
        lACss += "position:absolute;";
        lACss += "left:" + this.mLeftOffset + "px;";
        lACss += "width:" + lImageWidth + "px;";
        lACss += "height:" + lImageHeight + "px;";

        var lDivCss = "";
        lDivCss += "position:absolute;";
        lDivCss += "background:#424242;";
        lDivCss += "opacity:0.7;";
        lDivCss += "width:100%;";
        lDivCss += "height:40px;";
        lDivCss += "bottom:0px;";
        lDivCss += "color:#FFFFFF;";
        lDivCss += "padding:3px;";
        lDivCss += "font:1em FuturaStd-Light;";


        //image CSS
        var lImageCSS = "";
        lImageCSS += "width:" + lImageWidth + "px;";
        lImageCSS += "height:" + lImageHeight + "px;";
        
        //append Image
        var lImageHTMLString = "<a style=\"" + lACss + "\" href=\"" + pHref + "\">" + '<div style="' + lDivCss + '">' + caption + '</div>' + "<img style=\"" + lImageCSS + "\" src=\"" + pImageURL + "\"></img></a>";
        var lImageHTMLElement = this.mImageContainer.append(lImageHTMLString);

        //increment this.mLeftOffset
        this.mLeftOffset += lImageWidth + this.mOptions.gap;

        //load next image
        this.loadNextImage();
    };
    $.mapLoading.prototype.animate = function()
    {
        if (this.mRunning == false) {
            this.mRunning = true;
            this.mInterval = setInterval(this.onAnimate.bind(this), this.mOptions.delay);

            var lThis = this;
            this.mImageContainer.mouseover(function(event)
            {
                lThis.stop();
            });
            this.mImageContainer.mouseout(function(event)
            {
                lThis.animate();
            });
        }
    };
    $.mapLoading.prototype.onAnimate = function()
    {
        var lThis = this;
        if (this.mImageContainer.children().length) {
            var lLeftImage = $(this.mImageContainer.children()[0]);
            var lLeftImageWidth = lLeftImage.width();
            var vOffset = "-=" + (lLeftImageWidth + this.mOptions.gap) + "px";
            this.mImageContainer.animate({
                left : vOffset
            }, this.mOptions.animationDuration, function()
            {
                lLeftImage.remove();

                lThis.loadNextImage();
            });
        }
    };
    $.mapLoading.prototype.stop = function()
    {
        clearInterval(this.mInterval);
        this.mRunning = false;
    };
    /**
     * mapLoading plugin
     */
    $.fn.maploading = function(pOptions)
    {
        if ( typeof pOptions === 'string')
        {
            if (pOptions === "destroy")
            {
                if ($(this).data('maploading'))
                    $(this).data('maploading').remove();

                return;
            }else{
                pOptions = {
                    url : pOptions
                };
            }
        }
        var o = $.extend({}, $.fn.maploading.defaults, pOptions);
        return this.each(function()
        {
            var $this = $(this);
            var ac = new $.mapLoading($this, o);
            $this.data('maploading', ac);
        });

    };
    
    $.fn.displayImages = function(pImages)
    {
        return this.each(function()
        {
            var $this = $(this);
            $this.data('maploading').displayImages(pImages);
        });
    };

    /**
     * Default pOptions for autocomplete plugin
     */
    $.fn.maploading.defaults = {
        delay : 3000,
        animationDuration : 500,
        gap : 10
    };

})(jQuery);
