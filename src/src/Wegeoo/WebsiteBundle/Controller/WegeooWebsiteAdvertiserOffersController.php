<?php

namespace Wegeoo\WebsiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Wegeoo\DataLayerBundle\Controller\CitiesController;

class WegeooWebsiteAdvertiserOffersController extends Controller
{
    public static $LOGGER;
   	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// ACTIONS
    public function renderAction()
 	{
        self::$LOGGER = $this->get("logger");

        //get context for the baseURL
        $lRequestContext = $this->get("router")->getContext();
 		
		//Create params used in the twig
    	$lRenderParams = array();
		$lRenderParams["baseURL"] 		= $lRequestContext->getBaseUrl() . "/";
		$lRenderParams["title"] 		= "Wegeoo - Advertiser Offers";
        $lRenderParams["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();


        $this->get("logger")->info("10");
        //render the index page
        return $this->render('WegeooWebsiteBundle:Default:advertiserOffers.html.twig', $lRenderParams);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////  TITLE
	protected function getTitle($pClassifiedTitle)
	{
		return sprintf("Wegeoo - %s" , $pClassifiedTitle);
	}
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// GET MOST POPULATED TOWNS
    protected function getMostPopulatedTowns()
    {
        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:City")->getCitiesFromPopulation(48);

        return $lViewData;
    }
	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// GET MOST POPULATED TOWNS
	protected function getClassifiedInformations($pReference)
	{
		$lRequestContext = $this->get("router")->getContext();

        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->getClassifiedFromReferenceAction($pReference);

        return $lViewData;
	}
}
