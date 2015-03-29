<?php

namespace Wegeoo\WebsiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Config\Definition\Exception\Exception;
use Symfony\Component\HttpFoundation\Session\Session;
use Wegeoo\DataLayerBundle\Entity\Classified;
use Wegeoo\DataLayerBundle\Entity\Data;
use Wegeoo\DataLayerBundle\Entity\Utils\ClassifiedUtils;

class WegeooWebsiteHomeController extends Controller
{
   	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// ACTIONS
    public function renderAction($pWegeooType, $pCategoryLocaleName,$pCityPostCode=null, $pCityName=null, $map = null, $search=null)
 	{
        $lSession = new Session();
        $lSession->start();
        $lSession->remove("references");

        //get website configuration
        $lConfiguration = $this->get("wegeoo")->getWegeooConfiguration($pWegeooType, $pCategoryLocaleName,$pCityPostCode, $pCityName, $map, $search);

        //add filters params
        $lConfiguration["filters"] = $this->getSearchParams($search);

        $this->get("logger")->info("lConfiguration:".var_export($lConfiguration,true));

        return $this->render('WegeooWebsiteBundle:Default:home.html.twig', $lConfiguration);
    }

	protected function getSearchParams($pSearch)
	{
		$lFilterParams = array();

		$lParams = explode("&", $pSearch);
		foreach($lParams as $lParam)
		{
			$lParamExploded = explode("=", $lParam);
			if ( count($lParamExploded) == 2)
			{
				$lShortKey = $lParamExploded[0];
				$lValue = $lParamExploded[1];

				if ( array_key_exists($lShortKey,ClassifiedUtils::$FIELDS))
                {
                    if ( isset(ClassifiedUtils::$FIELDS[$lShortKey]) && ClassifiedUtils::$FIELDS_TYPE[$lShortKey])
                    {
                        $lKey           = ClassifiedUtils::$FIELDS[$lShortKey];
                        $lValueType     = ClassifiedUtils::$FIELDS_TYPE[$lShortKey];
                        if ( $lKey != "")
                        {
                            switch($lValueType)
                            {
                                case "string":
                                case "integer":
                                    $lFilterParams[$lKey] = $lValue;
                                    break;
                                case "array":
                                case "interval":
                                    $lFilterParams[$lKey] = explode("," , $lValue);
                                    break;
                            }
                        }
                    }
                }
			}
		}

		return $lFilterParams;
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// GET USER CITY
	protected function getLocaleFromAcceptedLanguage($pLanguage)
	{
		$lLocale = "en_US";
		
		switch($pLanguage)
		{
			case "fr_FR": $lLocale = "fr"; break;
			case "en_GB": $lLocale = "gb"; break;
		}
		
		return $lLocale;
	}
}
