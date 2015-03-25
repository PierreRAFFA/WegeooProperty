/*
 * Energetic Arrow 0.1
 *
 * Copyright 2014, Pierre RAFFA
 * Wegeoo.com
 * http://www.wegeoo.com/
 *
*/
(function($)
{
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// 
    /**
     * Energetic Arrow plugin
     */
    $.fn.energeticArrow = function(pOptions)
    {
        if ( typeof pOptions === 'string')
        {
            if (pOptions === "destroy")
            {
                if ($(this).data('energeticArrow'))
                    $(this).data('energeticArrow').remove();

                return;
            }else{
                pOptions = {
                    url : pOptions
                };
            }
        }
        var o = $.extend({}, $.fn.energeticArrow.defaults, pOptions);
        return this.each(function()
        {
            var $this = $(this);
            var ac = new $.EnergeticArrow($this, o);
            $this.data('energeticArrow', ac);
        });

    };
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CONTRUCTOR
    /**
     * EnergeticArrow Object
     * @param {jQuery} $pElement jQuery object with one input tag
     * @param {Object=} pOptions Settings
     * @constructor
     */
    $.EnergeticArrow = function($pElement, pOptions)
    {
        this.mElement = $pElement;

        this.mOptions = pOptions;

        /**
         * Assert parameters
         */
        if (!$pElement || !( $pElement instanceof jQuery) || $pElement.length !== 1 || $pElement.get(0).tagName.toUpperCase() !== 'DIV') {
            alert('Invalid parameter for jquery.EnergeticArrow, jQuery object with one element with INPUT tag expected');
            return;
        }

        //init component
        this.createArrow();
    };
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// CREATE ARROW
    $.EnergeticArrow.prototype.createArrow = function()
    {
        if ( this.mElement == null ) return;

        var lCanvass   = this.mElement.find('canvas');
        var lLetters    = this.mElement.find('.detailsEnergyLetter');


        if ( lCanvass.length)
        {
            var lCanvas     = lCanvass[0];
            var vContext    = lCanvas.getContext('2d');
            
            var lingrad = vContext.createLinearGradient(0,0,0,26);
            
            var vColor1;
            var vColor2;
            var vWidth;
            var vCategory;

            var vValue = this.mElement.attr("data-value");
            if (this.mOptions.type == $.fn.energeticArrow.ENERGY_CONSUMPTION )
            {
                
                if      ( vValue > 450  )   {vColor2='#C20000';vColor1='#FF5F5F';vWidth=310;vCategory="G";}
                else if ( vValue >= 331 )   {vColor2='#E34808';vColor1='#FF7977';vWidth=290;vCategory="F";}
                else if ( vValue >= 231 )   {vColor2='#D67912';vColor1='#FFB61E';vWidth=270;vCategory="E";}
                else if ( vValue >= 151 )   {vColor2='#D6BC45';vColor1='#F4E62B';vWidth=250;vCategory="D";}
                else if ( vValue >= 91  )   {vColor2='#89B41C';vColor1='#BCF02B';vWidth=230;vCategory="C";}
                else if ( vValue >= 51  )   {vColor2='#187912';vColor1='#42C100';vWidth=210;vCategory="B";}
                else if ( vValue > 0    )   {vColor2='#075104';vColor1='#46B20F';vWidth=190;vCategory="A";}
                else                        {vColor2='#9B9B9B';vColor1='#CBCBCB';vWidth=150;vCategory="";}
                
                if ( lLetters.length)
                {
                    var lLetter = lLetters[0];
                    $(lLetter).html(vCategory);
                }
            }
            else if (this.mOptions.type == $.fn.energeticArrow.GREENHOUSE_GASES_EMISSION)
            {
                if      ( vValue > 450  )   {vColor1='#6201DE';vColor2='#453983';vWidth=310;vCategory="G";}
                else if ( vValue >= 331 )   {vColor1='#8C4AEA';vColor2='#5B478C';vWidth=290;vCategory="F";}
                else if ( vValue >= 231 )   {vColor1='#A470EE';vColor2='#79659E';vWidth=270;vCategory="E";}
                else if ( vValue >= 151 )   {vColor1='#BC93F1';vColor2='#9A83AF';vWidth=250;vCategory="D";}
                else if ( vValue >= 91  )   {vColor1='#C8A8F4';vColor2='#A996BA';vWidth=230;vCategory="C";}
                else if ( vValue >= 51  )   {vColor1='#DFC0F8';vColor2='#BAABC6';vWidth=210;vCategory="B";}
                else if ( vValue > 0    )   {vColor1='#DFC0F8';vColor2='#BAABC6';vWidth=190;vCategory="A";}
                else                        {vColor2='#9B9B9B';vColor1='#CBCBCB';vWidth=150;vCategory="";}
                
                if ( lLetters.length)
                {
                    var lLetter = lLetters[0];
                    $(lLetter).html(vCategory);
                }
            }
            
            $(lCanvas).attr("width" , vWidth + "px");

            lingrad.addColorStop(0, vColor1);
            lingrad.addColorStop(1, vColor2);
            
            vContext.fillStyle = lingrad;
            
            vContext.beginPath();
            vContext.moveTo(0, 0);
            vContext.lineTo(vWidth-20,0);
            vContext.lineTo(vWidth,13);
            vContext.lineTo(vWidth-20,26);
            vContext.lineTo(0,25);
            vContext.closePath();
            vContext.fill();
        }else{
            console.log("The Energetic Arrow must contain a canvas named 'energyArrow'.");
        }
    };
    ///////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////// 
    /**
     * Default pOptions for autocomplete plugin
     */
    $.fn.energeticArrow.defaults = {
        /** Can be energyConsumption, greenhouseGasesEmission */
        type : null, 
        /** Energetic Value */
        value : null
    };

    $.fn.energeticArrow.ENERGY_CONSUMPTION          = "energyConsumption";
    $.fn.energeticArrow.GREENHOUSE_GASES_EMISSION   = "greenhouseGasesEmission";
})(jQuery);