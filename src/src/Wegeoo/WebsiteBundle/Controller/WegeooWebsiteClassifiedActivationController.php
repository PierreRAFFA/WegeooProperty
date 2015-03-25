<?php

namespace Wegeoo\WebsiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Wegeoo\DataLayerBundle\Controller\CitiesController;

class WegeooWebsiteClassifiedActivationController extends Controller
{
    public static $LOGGER;
   	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// ACTIONS
    public function renderAction($reference, $activationCode)
 	{
        self::$LOGGER = $this->get("logger");

        //get context for the baseURL
        $lRequestContext = $this->get("router")->getContext();


        $lClassifieds = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->findBy(array("reference" => $reference , "activationCode" => $activationCode));

        //$this->get("logger")->info("lClassifieds:".var_export($lClassifieds,true));

        //Create params used in the twig
        $lRenderParams = array();
        $lRenderParams["baseURL"] 		= $lRequestContext->getBaseUrl(). "/";
        $lRenderParams["title"] 		= "Wegeoo - Activation";
        $lRenderParams["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();

        if ( count($lClassifieds) == 1)
        {
            //activate classified
            $lClassified = $lClassifieds[0];
            $lClassified->setActive(true);
            $this->getDoctrine()->getManager()->flush();

            //render the index page
            return $this->render('WegeooWebsiteBundle:Default:classifiedActivation.html.twig', $lRenderParams);
        }else{
            //render the index page
            return $this->render('WegeooWebsiteBundle:Default:classifiedActivationError.html.twig', $lRenderParams);
        }
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
