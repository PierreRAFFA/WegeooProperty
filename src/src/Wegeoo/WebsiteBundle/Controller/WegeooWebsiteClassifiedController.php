<?php

namespace Wegeoo\WebsiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Wegeoo\DataLayerBundle\Controller\CitiesController;
use Wegeoo\DataLayerBundle\Controller\ClassifiedController;
use Wegeoo\DataLayerBundle\Entity\Classified;
use Wegeoo\WebsiteBundle\Utils\WegeooWebsiteUtils;

class WegeooWebsiteClassifiedController extends Controller
{
    public static $LOGGER;
   	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// ACTIONS
    public function renderAction($reference)
 	{
        self::$LOGGER = $this->get("logger");

 		//@HARDCODE
		//$_SERVER['REMOTE_ADDR'] 			= '91.109.47.11';
 		//$_SERVER['HTTP_ACCEPT_LANGUAGE']	= "fr_FR";
 		
 		//change locale
// 		$lLocale = $this->get("user_configuration")->getLocaleFromAcceptedLanguage($_SERVER['HTTP_ACCEPT_LANGUAGE']);
// 		$request = $this->getRequest();
//	    $request->setLocale($lLocale);
		
 		//get context for the baseURL
 		$lRequestContext = $this->get("router")->getContext();
		
		//get Wegeoo configuration
		$lConfiguration = $this->get("user_configuration")->getWebsiteConfigurationFromUser();
		
		//get the classified informations
		$lClassifiedInformations = $this->getClassified($reference);

        //get previous and next classified informations
        $lPreviousClassifiedURL    = NULL;
        $lNextClassifiedURL        = NULL;
        $lSession = $this->getRequest()->getSession();
        if ( $lSession->has("references"))
        {
            $lReferences = $lSession->get("references");
            $lReferenceIndex = array_search($reference , $lReferences);

            //previous
            if ( $lReferenceIndex - 1 >= 0)
            {
                $lPreviousClassifiedURL = $this->get("wegeoo")->getClassifiedURL($this->getClassified($lReferences[$lReferenceIndex - 1]));
            }

            //next
            if ( $lReferenceIndex + 1 <= count($lReferences))
            {
                $lNextClassifiedURL = $this->get("wegeoo")->getClassifiedURL($this->getClassified($lReferences[$lReferenceIndex + 1]));
            }
        }

        $this->get("logger")->info("lClassifiedInformations:".var_export($lClassifiedInformations,true));
        $this->get("logger")->info("lPreviousClassifiedURL:".var_export($lPreviousClassifiedURL,true));
        $this->get("logger")->info("lNextClassifiedURL:".var_export($lNextClassifiedURL,true));

        if ( $lClassifiedInformations !== FALSE)
        {
            //Create params used in the twig
            $lRenderParams = array();
            $lRenderParams["baseURL"] 		        = $lRequestContext->getBaseUrl();
            $lRenderParams["title"] 		        = $this->getTitle($lClassifiedInformations->getTitle());
            $lRenderParams["classified"] 	        = $lClassifiedInformations;
            $lRenderParams["previousClassifiedURL"] = $lPreviousClassifiedURL;
            $lRenderParams["nextClassifiedURL"] 	= $lNextClassifiedURL;
            $lRenderParams["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();

            //start session
            $session = $this->getRequest()->getSession();
            $session->start();
            $this->get("logger")->info("session->getId():".$session->getId());

            //set session key for the captcha
            $session->set('captcha_whitelist_key', array($session->getId()));
            $session->set('sessionid', $session->getId());

            $this->get("logger")->info("10");
            //render the index page
            return $this->render('WegeooWebsiteBundle:Default:classified.html.twig', $lRenderParams);
        }else{
            //Create params used in the twig
            $lRenderParams = array();
            $lRenderParams["baseURL"] 		    = $lRequestContext->getBaseUrl();
            $lRenderParams["title"] 		    = $this->get("translator")->trans("classified.undefined.title");
            $lRenderParams["mostPopulatedTowns"]= $this->getMostPopulatedTowns();

            return $this->render('WegeooWebsiteBundle:Default:classifiedUndefined.html.twig', $lRenderParams);
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
    /**
     * @param $pReference
     * @return Classified
     */
	protected function getClassified($pReference)
	{
		$lRequestContext = $this->get("router")->getContext();

        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->getClassifiedFromReferenceAction($pReference);

        return $lViewData;
	}
}
