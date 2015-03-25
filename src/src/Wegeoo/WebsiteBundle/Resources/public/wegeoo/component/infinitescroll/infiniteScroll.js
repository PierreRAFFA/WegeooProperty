(function( $ ){
	///////////////////////////////////////////////////////////////
	////////////////////////////////////////////////// ACTIVE INFINITE SCROLL 
 	$.fn.infiniteScroll = function(options) {
  	
		/** Infinite Scroll Options */
		var opts = $.extend($.fn.infiniteScroll.defaults, options);
		
		//sort args
		if ( opts.sort)
		{
			opts.args = $.fn.infiniteScroll.sort(opts);
		}
		
		var mScrollIndex = 0;
		
		var target = opts.scrollTarget;
		if (target == null){
			target = obj; 
	 	}
		opts.scrollTarget = target;
	 
		return this.each(function() {
		  $.fn.infiniteScroll.init($(this), opts);
		});
  	};
  	
  	$.fn.infiniteScroll.init = function(obj, opts){
		 var target = opts.scrollTarget;
		 var lLoadContentAtStart = opts.loadContentAtStart;
		 
		 $(obj).attr('infiniteScroll', 'enabled');
		
		 $(target).scroll(function(event){
			if ($(obj).attr('infiniteScroll') == 'enabled'){
		 		$.fn.infiniteScroll.loadContent(obj, opts);		
			}
			else {
				event.stopPropagation();	
			}
		 });
	 	
	 	$.fn.infiniteScroll.scrollIndex = 0;
	    $.fn.infiniteScroll.loadContent(obj, opts , true);
	 
 	};
  	///////////////////////////////////////////////////////////////
	////////////////////////////////////////////////// SORT ARGS
	$.fn.infiniteScroll.sort = function(pOpts)
  	{
  		var lSortedArgs = pOpts.args;
  		var lRegExp 	= new RegExp("([a-zA-Z]*)(ASC|DESC)", "g");
  		var lRegResult 	= lRegExp.exec(pOpts.sort);
  		
  		if ( lRegResult.length == 3)
  		{
  			var lFieldName = lRegResult[1];
  			var lSortType  = lRegResult[2];
  			
  			lSortedArgs = lSortedArgs.sort(function(pA,pB)
  			{
  				if (lSortType == "DESC")
  				{
  					return (pA[lFieldName] > pB[lFieldName]) ? "-1" : "1";
  				}else if (lSortType == "ASC")
  				{
  					return (pA[lFieldName] > pB[lFieldName]) ? "1" : "-1";
  				}
  			});
  		}
  		
  		return lSortedArgs;
  	};
  	
  	///////////////////////////////////////////////////////////////
	////////////////////////////////////////////////// DISABLE INFINITE SCROLL
  	$.fn.disableInfiniteScroll = function(){
	  return this.each(function() {
	 	$(this).attr('infiniteScroll', 'disabled');
	  });
	  
  	};
  	///////////////////////////////////////////////////////////////
	////////////////////////////////////////////////// LOAD CONTENT
	$.fn.infiniteScroll.loadContent = function(obj, opts , initialized)
	{
		var target = opts.scrollTarget;
		var mayLoadContent = $(target).scrollTop()+opts.heightOffset >= $(document).height() - $(target).height();
		
		if ( $.fn.infiniteScroll.running == false)
		{
			if ( opts.args.length)
			{
				if (mayLoadContent || initialized)
				{
			 		//onBeforeLoad
				 	if (opts.beforeLoad != null){
						opts.beforeLoad(); 
				 	}
				 	$(obj).children().attr('rel', 'loaded');
				 
				 	//get args to create the URL
				 	var lBeginIndex = $.fn.infiniteScroll.scrollIndex * opts.contentDataStep;
					var lEndIndex = lBeginIndex + opts.contentDataStep;
					
					//limit on EndIndex
					if (lEndIndex > opts.args.length)
					    lEndIndex = opts.args.length;
					
					//get current references to load
					var lCurrentArgs = opts.args.slice(lBeginIndex, lEndIndex);
				 	//alert("lCurrentArgs:"+lCurrentArgs);
				 	
				 	if ( lCurrentArgs.length)
				 	{
				 		//get URL
					 	var lURL = null;
					 	if (opts.buildURL != null){
							lURL = opts.buildURL(lCurrentArgs); 
					 	}else{
					 		lURL = "@TODO";
					 	}
					 	
					 	//set to running true
			 			$.fn.infiniteScroll.running = true;
			 		
					 	//call service
					 	$.ajax({
						  type: 'GET',
						  url: lURL,
						  success: function(data)
						  {
						  	$.fn.infiniteScroll.running = false;
						  	
						    if (initialized)
							    $(obj).html(data);
							 else
							    $(obj).append(data);
							
							$.fn.infiniteScroll.scrollIndex++;
							
							var objectsRendered = $(obj).children('[rel!=loaded]');
							
							//onAfterLoad
							if (opts.afterLoad != null){
								opts.afterLoad(objectsRendered);	
							}
						  },
						  error: function(XMLHttpRequest, textStatus, errorThrown) { 
						        alert("Status: " + textStatus); alert("Error: " + errorThrown); 
						    },  
						  dataType: 'html'
					 	});
				 	}
				}
		 	}
			
		}
  	};
  	
  	///////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////
	/** Default configuration */
	$.fn.infiniteScroll.defaults = {
      	 'contentPage' : null,
      	 'args' : null,
     	 'contentData' : {},
     	 'sort' : null,
     	 'buildURL' : null,
		 'beforeLoad': null,
		 'afterLoad': null	,
		 'scrollTarget': null,
		 'heightOffset': 0,
		 'loadContentAtStart' : true  
	};	
	
	/** Current Scroll Index */
	$.fn.infiniteScroll.scrollIndex = 0;
  
	/** Current Scroll Index */
	$.fn.infiniteScroll.running = false;
  
})( jQuery );