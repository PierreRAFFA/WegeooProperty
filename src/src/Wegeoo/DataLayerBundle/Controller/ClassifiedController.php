<?php

namespace Wegeoo\DataLayerBundle\Controller;

use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\View\View AS FOSView;
use FOS\RestBundle\Controller\Annotations\Get;
use Symfony\Component\HttpFoundation\Session\Session;
use Wegeoo\DataLayerBundle\Entity\Classified;

class ClassifiedController extends FOSRestController
{
    public static $LOGGER;

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////   GET
    /**
     * Get Classified From Reference
     *
     * @param $pReference
     * @return Response
     */
    public function getClassifiedAction($pReference)
    {
        $lViewData 			= NULL;
        $lViewStatusCode 	= 200;

        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->getClassifiedFromReferenceAction($pReference);


        //$this->get("logger")->info($lViewData);
        //$this->updateAllDetails();

        $lView = FOSView::create();
        $lView->setStatusCode(200)->setData($lViewData);
        return $this->handleView($lView);
    }
    /**
     * GET Classifieds from filters
     *
     * @Get("/classifieds")
     * @QueryParam(name="filters", default="{}" , description="Name of the filter")
     *
     * @param ParamFetcher $paramFetcher
     * @return Response
     */
    public function getClassifiedsAction( ParamFetcher $paramFetcher)
    {
        self::$LOGGER = $this->get("logger");

//        $lLogger = new \Doctrine\DBAL\Logging\DebugStack();
//        $this->get("doctrine")
//            ->getConnection()
//            ->getConfiguration()
//            ->setSQLLogger($lLogger);

        $lViewData 			= NULL;
        $lViewStatusCode 	= 200;

        //get params
        $lFilterParamsJSON	= json_decode(stripslashes($paramFetcher->get("filters")));

        $this->get("logger")->info("filters:".$paramFetcher->get("filters"));
        $this->get("logger")->info("filters:".var_export($lFilterParamsJSON,true));

        $lSearchType = $lFilterParamsJSON->filterType;
        unset($lFilterParamsJSON->filterType);

        switch($lSearchType)
        {
            case "getGeolocation":
                $lViewData = $this->getDoctrine()->getManager()
                    ->getRepository("WegeooDataLayerBundle:Classified")->getClassifiedsGeolocation($lFilterParamsJSON);
                break;

            case "getLatestIn":
                return $this->getLatestIn($lFilterParamsJSON);
                break;

            case "getLatestAround":
                return $this->getLatestAround($lFilterParamsJSON);
                break;
        }

        //Create View
        $lView = FOSView::create();
        $lView->setStatusCode($lViewStatusCode)->setData($lViewData);
        return $this->handleView($lView);
    }

    protected function getLatestIn($pFilterParamsJSON)
    {
        $lViewStatusCode 	= 200;

        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->getLatestClassifiedsIn($pFilterParamsJSON);

        foreach($lViewData as $lClassified)
        {
            $lURL = $this->get("wegeoo")->getClassifiedURL($lClassified);
            $lClassified->setURL($lURL);
        }

        //Create View
        $lView = FOSView::create();
        $lView->setStatusCode($lViewStatusCode)->setData($lViewData);
        $lView = $this->handleView($lView);

        return $lView;
    }
    protected function getLatestAround($pFilterParamsJSON)
    {
        $lViewStatusCode 	= 200;

        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->getLatestClassifiedsAround($pFilterParamsJSON);

        foreach($lViewData as $lClassified)
        {
            //set url
            $lURL = $this->get("wegeoo")->getClassifiedURL($lClassified);
            $lClassified->setURL($lURL);

            //get title
            $lTitle = substr($lClassified->getTitle() , 0 , 28);
            if ( strlen($lClassified->getTitle()) > 28)
                $lTitle .= "...";

            //get price
            $lDetails = $lClassified->getDetails();
            if ( isset($lDetails["price"]))
            {
                $lPrice = $this->get("wegeoo")->formatPrice($lDetails["price"] , $this->container->getParameter("country") );
            }else{
                $lPrice = $this->get("translator")->trans("classified.data.empty");
            }

            //compute caption
            $lCaption = sprintf("%s<br/>%s" , $lTitle , $lPrice);

            //set caption
            $lClassified->setCaption($lCaption);
        }

        //Create View
        $lView = FOSView::create();
        $lView->setStatusCode($lViewStatusCode)->setData($lViewData);
        $lView = $this->handleView($lView);

        return $lView;
    }
    /**
     * HARDCODE
     */
    protected function updateAllDetails()
    {
        $lPropertyType = array("apartment" , "house" , "parking");
        $lHeating = array("electricity");

        $lClassifieds = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->findAll();

        foreach($lClassifieds as $lClassified)
        {
            $lDetails = array();
            $lDetails["numRooms"] = rand(3,7);
            $lDetails["propertyType"] = $lPropertyType[rand(0,1) * (count($lPropertyType) - 1)];
            $lDetails["price"] = rand(400, 2000);
            $lDetails["livingArea"] = rand(50,250);
            $lDetails["livingRoomArea"] = rand(30,80);
            $lDetails["heating"] = $lHeating[rand(0,1) * (count($lHeating) - 1)];
            $lDetails["numFloors"] = rand(0,3);
            $lDetails["numBedrooms"] = rand(0,5);
            $lDetails["numBathrooms"] = rand(0,2);
            $lDetails["numToilets"] = rand(0,2);
            if ( rand(0,10) > 3)
                $lDetails["greenhouseGasesEmission"] = rand(0,700);
            if ( rand(0,10) > 3)
                $lDetails["energyConsumption"] = rand(0,700);

            $lClassified->setDetails($lDetails);
            $this->getDoctrine()->getManager()->persist($lClassified);
        }
        $this->getDoctrine()->getManager()->flush();
    }
    /**
     * GET the Preview Classifieds from references
     *
     * @Get("/previewclassifieds")
     *
     * @QueryParam(name="references", default="{}", description="All classifieds reference to treat")
     * @QueryParam(name="sort", requirements="[a-zA-Z]*", default="priceASC", description="formed as 'fieldSORT' (per exemple priceDESC)")
     *
     * @param ParamFetcher $pParamFetcher
     * @return FosView
     */
    public function getPreviewClassifiedFromReferencesAction(ParamFetcher $pParamFetcher)
    {
        self::$LOGGER = $this->get("logger");

        $lViewData 			= NULL;
        $lViewStatusCode 	= 200;

        //get params
        $lSort 					= $pParamFetcher->get("sort");
        $lExplodedReferences 	= explode(",", $pParamFetcher->get("references"));

        //request
        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->getPreviewClassifiedFromReferencesAction($lExplodedReferences,$lSort);

        foreach($lViewData as $lClassified)
        {
            //set url
            $lURL = $this->get("wegeoo")->getClassifiedURL($lClassified);
            $lClassified->setURL($lURL);
        }

        $lView = FOSView::create();
        $lView->setStatusCode(200)->setData($lViewData);
        //return $this->handleView($lView);

        $lRenderParams = array();
        $lRenderParams["classifieds"] = $lViewData;
        $lRender = $this->render('WegeooWebsiteBundle:Default:previewClassified.html.twig' , $lRenderParams);
        return $lRender;
    }
    ////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////   PATCH
    public function patchClassifiedAction(Request $pRequest, $pReference)
    {
        $this->get("logger")->info(__METHOD__);
        $this->get("logger")->info(var_export($pReference,true));

        //get classifieds from reference
        $lManager = $this->getDoctrine()->getManager();
        $lClassifieds = $lManager->getRepository("WegeooDataLayerBundle:Classified")->findByReference($pReference);

        //control result
        if (!$lClassifieds) {
            throw $this->createNotFoundException(
                'No classified found for reference '.$pReference
            );
        }

        //get classified
        $lClassified = $lClassifieds[0];

        //get parameters
        $lParameters = $pRequest->request->all();
        $this->get("logger")->info(var_export($lParameters,true));

        $lSuccess = $this->doSpecificAction($pRequest,$lClassified);

        if ( $lSuccess )
        {
            //update fields
            foreach($lParameters as $lParameterName => $lParameterValue)
            {
                $this->get("logger")->info("lParameterName:".$lParameterName);
                if ($lParameterName == "reference" ) continue;

                $lMethod    = NULL;
                $lValue     = $lParameterValue;
                if ( $lParameterValue == "+")
                {
                    //We have to increment
                    $lMethod    = "increment" . ucfirst($lParameterName);
                    $lValue     = null;

                }else{
                    $lMethod   = "set" . ucfirst($lParameterName);
                }

                $this->get("logger")->info("lMethod:".$lMethod);
                //$this->get("logger")->info("lValue:".$lValue);

                //update the entity
                if ( method_exists($lClassified , $lMethod))
                {
                    $this->get("logger")->info("Call $lMethod");
                    if ( is_null($lValue) == FALSE)
                    {
                        $lClassified->$lMethod($lValue);
                    }else{
                        $lClassified->$lMethod();
                    }
                }
            }
            $this->get("logger")->info("flush");
            //update bdd
            $lManager->flush();
            $this->get("logger")->info("flushed");
        }

        //response
        $lStatusCode = 200;
        $lViewData   = true;
        if ( $lSuccess === FALSE)
        {
            $lStatusCode = 400;
            $lViewData = false;
        }

        $lView = FOSView::create();
        $lView->setStatusCode($lStatusCode)->setData($lViewData);
        return $this->handleView($lView);
    }
    ////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////// POST

    ////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////// DELETE

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////  SPECIFIC ACTIONS
    /**
     * Executes a specific action depending on $pRequest and returns success
     *
     * @param Request $pRequest
     * @param $pClassified
     * @return bool
     */
    protected function doSpecificAction(Request $pRequest , $pClassified)
    {
        //get parameters
        $lSuccess = FALSE;

        //call correct action
        $lParameters = $pRequest->request->all();
        if ( isset($lParameters["action"]) && isset($lParameters["action"]["name"]) )
        {
            $lMethod = $lParameters["action"]["name"];
            $lSuccess = $this->$lMethod($pClassified,$lParameters["action"]);
        }

        return $lSuccess;
    }

    /**
     * Contact Advertiser ( visitor to advertiser )
     *
     * @param $pClassified
     * @param $lActionParameters
     * @return bool
     */
    protected function contactAdvertiser($pClassified,$lActionParameters)
    {
        $lSuccess = FALSE;
        $this->get("logger")->info(__METHOD__);
        $this->get("logger")->info(var_export($lActionParameters,true));

        if ( is_null($pClassified->getContact()) == FALSE && $pClassified->getContact() != "")
        {
            $lClassifiedURLParameters = array();
            $lClassifiedURLParameters["pWegeooType"]        = $this->get("translator")->trans("property" , array(), null, $pClassified->getCountryCode());
            $lClassifiedURLParameters["pCategoryLocaleName"]= $this->get("translator")->trans($pClassified->getType() , array(), null, $pClassified->getCountryCode());
            $lClassifiedURLParameters["pCityPostCode"]      = $pClassified->getCity()->getPostCode();
            $lClassifiedURLParameters["pCityName"]          = strtolower($pClassified->getCity()->getUppercaseName());
            $lClassifiedURLParameters["pReference"]         = $pClassified->getReference();

            $lActionParameters["classified"] = array();
            $lActionParameters["classified"]["contact"]     = $pClassified->getContact();
            $lActionParameters["classified"]["url"]         = $this->generateUrl('wegeoo_website_classifiedpage', $lClassifiedURLParameters, true );

            $this->get("logger")->info("lActionParameters:".var_export($lActionParameters,true));

            $lEmailRender = $this->renderView('WegeooDataLayerBundle:email:contactAdvertiser.html.twig',$lActionParameters );
            $this->get("logger")->info("lEmailRender:".$lEmailRender);

            $lMessage = \Swift_Message::newInstance()
                ->setSubject('Message privé d\'un visiteur')
                ->setFrom($lActionParameters["userEmail"])
                ->setTo("holala011@hotmail.com")
                ->addPart($lEmailRender, 'text/html');

            $lSuccess = $this->get('mailer')->send($lMessage);
            $this->get("logger")->info("lSuccess:".var_export($lSuccess,true));
        }


        return $lSuccess;
    }
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////  GET MEDIAS
	protected function getClassifiedMedias($pReference)
	{
		$lMedias = array();

		$lClassifiedAssetDirectory = sprintf("/var/www/storage/%s/medias" , $pReference);
		if ( file_exists($lClassifiedAssetDirectory) && is_dir($lClassifiedAssetDirectory))
		{
			$lMediaFiles = scandir($lClassifiedAssetDirectory);

			if ( count($lMediaFiles) > 2)
			{
				foreach($lMediaFiles as $lMediaFile)
				{
					if (substr($lMediaFile, 0 , 1) == "." ) continue;

					$lMediaURL = sprintf("/storage/%s/medias/%s" , $pReference , $lMediaFile);
					$lMedias[] = $lMediaURL;
				}
			}
		}
		//return array("/storage/wg-aze126/medias/1DG78F7G90.jpg" , "/storage/wg-aze126/medias/2DG87F89GUIJ.jpg");
		return $lMedias;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////  GET QRCODE
	protected function getClassifiedQRCode($pReference)
	{
		$lQRCodeURL = sprintf("/storage/%s/qrcode.png" , $pReference);
		return $lQRCodeURL;
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////// à placer dans un service wegeoo-string
	/*protected function removeSpecialChars($pString, $pCharset='utf-8')
	{
	    $pString = htmlentities($pString, ENT_NOQUOTES, $pCharset);
	    
	    $pString = preg_replace('#&([A-za-z])(?:acute|cedil|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $pString);
	    $pString = preg_replace('#&([A-za-z]{2})(?:lig);#', '\1', $pString); // pour les ligatures e.g. '&oelig;'
	    $pString = preg_replace('#&[^;]+;#', '', $pString); // supprime les autres caractères
	    
	    return $pString;
	}
	*/
}