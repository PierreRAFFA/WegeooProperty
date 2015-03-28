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
    public function renderAction($pWegeooType, $pCategoryLocaleName,$pCityPostCode=null, $pCityName=null, $map = null, $pSearch=null)
 	{
        $lSession = new Session();
        $lSession->start();
        $lSession->remove("references");

 		//@HARDCODE
 		//$_SERVER['HTTP_ACCEPT_LANGUAGE']	= "fr_FR";

     	//change locale
// 		$lLocale = $this->getLocaleFromAcceptedLanguage($_SERVER['HTTP_ACCEPT_LANGUAGE']);
// 		$request = $this->getRequest();
//	    $request->setLocale($lLocale);
		
 		$translated = $this->get('translator')->trans('LastClassifiedsOn');
		//$this->get("logger")->info("acceptLang:".$_SERVER['HTTP_ACCEPT_LANGUAGE']);

        //get website configuration
        $lConfiguration = $this->getWegeooConfiguration($pWegeooType, $pCategoryLocaleName,$pCityPostCode, $pCityName, $map, $pSearch);

        $this->get("logger")->info("lConfiguration:".var_export($lConfiguration,true));

        return $this->render('WegeooWebsiteBundle:Default:home.html.twig', $lConfiguration);
    }

    protected function getWegeooConfiguration($pWegeooType, $pCategoryLocaleName,$pCityPostCode=null, $pCityName=null, $map = null, $pSearch=null)
    {
        //find the city from name and postCode
        $lCityName = NULL;
        $lCityPostCode = NULL;

        if ( $pCityPostCode !== "" && $pCityName !== "")
        {
            $lSlugName = $this->get("wegeoo")->getSlugName($pCityPostCode,$pCityName);

            $this->get("logger")->info("lSlugName:" . $lSlugName);
            $lCities = $this->getDoctrine()
                ->getRepository("WegeooDataLayerBundle:City")
                ->findBy(array("slugName" => $lSlugName));

            $this->get("logger")->info("count(lCities):" . count($lCities));

            if (count($lCities) == 1)
            {
                $lCityPostCode  = $lCities[0]->getPostCode();
                $lCityName      = $lCities[0]->getName();
            }
        }

        //set the default city if nothing is specified or found above
        if ( $lCityName === NULL && $lCityPostCode === NULL)
        {
            $lCityPostCode = $this->container->getParameter("default_city_postcode");
            $lCityName     = $this->container->getParameter("default_city_name");
        }

        $lConfiguration = array();

        $lConfiguration["cityPostCode"]         = $lCityPostCode;
        $lConfiguration["cityName"]             = $lCityName;
        $lConfiguration["title"] 		        = $this->get("translator")->trans("wegeoo.meta.title");
        $lConfiguration["title"]                = sprintf($lConfiguration["title"] , ucfirst($lConfiguration["cityName"]));
        $lConfiguration["description"] 		    = $this->get("translator")->trans("wegeoo.meta.description");
        $lConfiguration["category"]             = $this->get("translator")->trans($pCategoryLocaleName , array(), "routing");
        $lConfiguration["filters"] 		        = $this->getSearchParams($pSearch);
        $lConfiguration["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();
        $lConfiguration["baseURL"] 				= $this->get("router")->getContext()->getBaseUrl();
        $lConfiguration["previewClassifiedAdTemplateURL"] = "";//@TODO create a config file

        $this->get("logger")->info("lConfiguration1:".var_export($lConfiguration,true));

        return $lConfiguration;
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
	/////////////////////////////////////////////////////////////////////////////// GET MOST POPULATED TOWNS
	protected function getMostPopulatedTowns()
	{
        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:City")->getCitiesFromPopulation(48);

        return $lViewData;
	}
	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// GET USER CITY
	protected function getUserConfiguration()
	{
		$this->get("logger")->info(__METHOD__);
		$this->get("logger")->info($_SERVER['REMOTE_ADDR']);

        $lRemoteAddr = $_SERVER['REMOTE_ADDR'];

        if ( $lRemoteAddr == '::1')
        {
            $lRemoteAddr = '91.109.47.11';
            $lRemoteAddr = '79.141.163.6';
        }
        $this->get("logger")->info("lRemoteAddr:".$lRemoteAddr);


		$lConfiguration = array();
		
		//detect user town in Database
        $lData = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:Data")
            ->findOneBy(array("key" => $lRemoteAddr, "type" => "userLocation"));
        $this->get("logger")->info("count(lData):".count($lData));

        if ( count($lData) == 1)
        {
            $lConfiguration = $lData->getValue();
            $this->get("logger")->info("lConfiguration from Data:".var_export($lConfiguration,true));
        }else{
            @$lContents = file_get_contents('http://www.geoplugin.net/php.gp?ip='.$lRemoteAddr);
            $this->get("logger")->info("URL:".'http://www.geoplugin.net/php.gp?ip='.$lRemoteAddr);
            $this->get("logger")->info("lContents:".var_export($lContents,TRUE));

            if ( $lContents !== FALSE)
            {
                $lUserLocalisation = unserialize($lContents);

                $this->get("logger")->info("lUserLocalisation:".var_export($lUserLocalisation,true));

                if ( is_null($lUserLocalisation) == FALSE && is_array($lUserLocalisation) && isset($lUserLocalisation["geoplugin_city"]))
                {
                    //country
                    $lConfiguration["countryCode"] 	= $lUserLocalisation["geoplugin_countryCode"];

                    //city
                    $lConfiguration["cityName"] 	= $lUserLocalisation["geoplugin_city"];

                    //get position
                    $lConfiguration["lat"] 	= $lUserLocalisation["geoplugin_latitude"];
                    $lConfiguration["lng"] = $lUserLocalisation["geoplugin_longitude"];

                    //store data
                    $lData = new Data();
                    $lData->setKey($lRemoteAddr);
                    $lData->setValue($lConfiguration);
                    $lData->setType("userLocation");
                    $this->getDoctrine()->getManager()->persist($lData);
                    $this->getDoctrine()->getManager()->flush();

                    //get cityPostCode ( usefull ? )
//                    $lLatLongToPostalCodeService = sprintf("http://www.geoplugin.net/extras/postalcode.gp?lat=%s&long=%s" , $lTownLatitude , $lTownLongitude );
//                    $lLatLongToPostalCodeServiceResults = unserialize(file_get_contents($lLatLongToPostalCodeService));
//                    if ( is_null($lLatLongToPostalCodeServiceResults) == FALSE && is_array($lLatLongToPostalCodeServiceResults) && isset($lLatLongToPostalCodeServiceResults["geoplugin_postCode"]))
//                    {
//                        $this->get("logger")->info("lLatLongToPostalCodeServiceResults:".var_export($lLatLongToPostalCodeServiceResults,true));
//                        $lConfiguration["cityPostCode"] = $lLatLongToPostalCodeServiceResults["geoplugin_postCode"];
//
//
//                    }else{
//                        $this->get("logger")->warn("Can not get the user city postCode");
//                    }
                }else{
                    $this->get("logger")->warn("Can not get the user location");
                }
            }else{
                $lConfiguration = FALSE;
            }
        }

		return $lConfiguration;
	}
	
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
