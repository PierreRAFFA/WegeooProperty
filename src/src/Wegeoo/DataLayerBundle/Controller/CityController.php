<?php

namespace Wegeoo\DataLayerBundle\Controller;

use Symfony\Component\HttpFoundation\Response;

use FOS\RestBundle\Request\ParamFetcher;
use FOS\RestBundle\Controller\Annotations\RequestParam;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\View\View AS FOSView;
use FOS\RestBundle\Controller\Annotations\Get;

class CityController extends FOSRestController
{
    /**
	 * GET cities depending on filter_name
	 * 
	 * @Get("/cities")
	 * 
	 * @QueryParam(name="filters", default="{}", description="Name of the filter")
	 * 
	 * @param ParamFetcher $pParamFetcher
	 * @return FosView
     */
    public function getCityAction(ParamFetcher $pParamFetcher)
	{
		$lViewData 			= "";
		$lViewStatusCode 	= 200;
		
		//get params
		$lFilterParamsJSON	= json_decode(stripslashes($pParamFetcher->get("filters")));
        $this->get("logger")->info("filters:".var_export($lFilterParamsJSON,true));

        if ( isset($lFilterParamsJSON->filterName))
        {
            $lFilterName = $lFilterParamsJSON->filterName;

            switch ($lFilterName) {
                case "mostPopulated":
                    $lLimit = 100;

                    //set limit
                    if (is_null($lFilterParamsJSON) == FALSE)
                        if (isset($lFilterParamsJSON->limit))
                            $lLimit = $lFilterParamsJSON->limit;

                    //exec query
                    $lViewData = $this->getDoctrine()->getManager()
                        ->getRepository("WegeooDataLayerBundle:City")->getCitiesFromPopulation($lLimit);
                    break;

                case "startwith":
                    $lBeginningLetters = NULL;

                    //set letters
                    if (is_null($lFilterParamsJSON) == FALSE) {
                        if (isset($lFilterParamsJSON->letters)) {
                            $lLetters = $lFilterParamsJSON->letters;

                            if (strlen($lLetters) >= 2) {
                                $lBeginningLetters = $lLetters;
                            } else {
                                $lViewStatusCode = 400;
                                $lViewData = "Must have at least two letters.";
                            }
                        } else {
                            $lViewStatusCode = 400;
                            $lViewData = "No letters found.";
                            $lViewData = var_export($lFilterParamsJSON, true);
                        }
                    } else {
                        $lViewStatusCode = 400;
                        $lViewData = "No sort found";
                    }

                    if (is_null($lBeginningLetters) == FALSE) {
                        $lLetters = $this->removeSpecialChars($lLetters);
                        $lLetters = strtoupper($lLetters);
                        //$lLetters = str_replace(" ", "-", $lLetters);
                        //$lLetters = str_replace("'", "-", $lLetters);
                        $this->get("logger")->info(var_export($lLetters, true));

                        $lViewData = $this->getDoctrine()->getManager()
                            ->getRepository("WegeooDataLayerBundle:City")->getCitiesFromNameStartWith($lLetters);
                    }
                    break;
            }
        }else{
            $lViewStatusCode = 400;
            $lViewData = "No Filter Selected";
        }

		//Create View
		$lView = FOSView::create();
		$lView->setStatusCode($lViewStatusCode)->setData($lViewData);
		
		//Create Response
		$lResponse = $this->handleView($lView);
		return $lResponse;
	}
	
	
	protected function removeSpecialChars($pString, $pCharset='utf-8')
	{
	    $pString = htmlentities($pString, ENT_NOQUOTES, $pCharset);
	    
	    $pString = preg_replace('#&([A-za-z])(?:acute|cedil|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $pString);
	    $pString = preg_replace('#&([A-za-z]{2})(?:lig);#', '\1', $pString); // pour les ligatures e.g. '&oelig;'
	    $pString = preg_replace('#&[^;]+;#', '', $pString); // supprime les autres caractères
	    
	    return $pString;
	}
}