/////////////////////////////////////////////////////////////////////////////////////////
///////////
///////////  Operation Class 
///////////
///////////
///////////
///////////
/////////////////////////////////////////////////////////////////////////////////////////
Wegeoo.Operation = function() {};

/** SEARCH */
Wegeoo.Operation.SEARCH_TOWNS 							= "searchTowns";
Wegeoo.Operation.SEARCH_CLASSIFIED_ADS 				    = "searchClassifiedAds"; 
Wegeoo.Operation.GET_CLASSIFIED_AD_LIST_VIEW 			= "getClassifiedAdListView"; 

Wegeoo.Operation.GET_ANNOUNCEMENT_LIST 				    = "get_announcement_list"; 
Wegeoo.Operation.GET_ANNOUNCEMENT_DETAILS 				= "get_announcement_details"; 

/** PUBLISH */
Wegeoo.Operation.UPLOAD_MEDIA 							= "upload_media";  
Wegeoo.Operation.GET_CATEGORY_PUBLICATION_FORM			= "get_category_publication_form"; 
Wegeoo.Operation.GET_USER_TYPE_FORM 					= "get_user_type_form"; 
Wegeoo.Operation.PUBLISH_ANNOUNCEMENT 					= "publish_announcement";  

/** AUTHOR */
Wegeoo.Operation.DELETE_ANNOUNCEMENT					= "delete_announcement";
Wegeoo.Operation.RECOVER_PASSWORD						= "recover_password";

/** VISITOR */
Wegeoo.Operation.GET_POPUP								= "get_popup";
Wegeoo.Operation.WARN_ANNOUNCEMENT						= "warn_announcement";
