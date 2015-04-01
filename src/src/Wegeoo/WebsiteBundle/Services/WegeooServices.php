<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 11/11/14
 * Time: 00:19
 */

namespace Wegeoo\WebsiteBundle\Services;


use Doctrine\ORM\EntityManager;
use Monolog\Logger;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Translation\Translator;
use Wegeoo\DataLayerBundle\Entity\Classified;

class WegeooServices
{
    protected $mContainer;
    protected $mRouter;
    protected $mLogger;
    protected $mTranslator;
    protected $mEntityManager;
    protected $mWegeooType;

    public function __construct(Container $container, Router $router , Logger $logger, Translator $translator ,
                                EntityManager $em, $wegeooType)
    {
        $this->mContainer = $container;
        $this->mEntityManager = $em;
        $this->mRouter = $router;
        $this->mLogger = $logger;
        $this->mTranslator = $translator;
        $this->mWegeooType = $wegeooType;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// GET WEGEOO CONFIGURATION
    public function getWegeooConfiguration($wegeooType, $categoryLocaleName,$cityPostCode=null, $cityName=null, $map = null, $search=null)
    {
        //find the city from name and postCode
        $lCityName = NULL;
        $lCityPostCode = NULL;

        if ( $cityPostCode !== "" && $cityName !== "")
        {
            $lSlugName = $this->getSlugName($cityPostCode,$cityName);

            $this->mLogger->info("lSlugName:" . $lSlugName);
            $lCities = $this->mEntityManager
                ->getRepository("WegeooDataLayerBundle:City")
                ->findBy(array("slugName" => $lSlugName));

            $this->mLogger->info("count(lCities):" . count($lCities));

            if (count($lCities) == 1)
            {
                $lCityPostCode  = $lCities[0]->getPostCode();
                $lCityName      = $lCities[0]->getName();
            }
        }

        //set the default city if nothing is specified or found above
        if ( $lCityName === NULL && $lCityPostCode === NULL)
        {
            $lCityPostCode = $this->mContainer->getParameter("default_city_postcode");
            $lCityName     = $this->mContainer->getParameter("default_city_name");
        }

        $lConfiguration = array();
        $lConfiguration["cityPostCode"]         = $lCityPostCode;
        $lConfiguration["cityName"]             = $lCityName;
        $lConfiguration["title"] 		        = $this->mTranslator->trans("wegeoo.meta.title");
        $lConfiguration["title"]                = sprintf($lConfiguration["title"] , ucfirst($lConfiguration["cityName"]));
        $lConfiguration["description"] 		    = $this->mTranslator->trans("wegeoo.meta.description");
        $lConfiguration["category"]             = $this->mTranslator->trans($categoryLocaleName , array(), "routing");
        $lConfiguration["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();
        $lConfiguration["baseURL"] 				= $this->mRouter->getContext()->getBaseUrl();
        $lConfiguration["previewClassifiedAdTemplateURL"] = "";//@TODO create a config file

        $this->mLogger->info("lConfiguration1:".var_export($lConfiguration,true));

        return $lConfiguration;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// GET USER LOCATION
    protected function getUserLocation()
    {
        $lRemoteAddr = $_SERVER['REMOTE_ADDR'];

        if ( $lRemoteAddr == '::1')
        {
            $lRemoteAddr = '91.109.47.11';
            $lRemoteAddr = '79.141.163.6';
        }

        $lConfiguration = array();

        //detect user town in Database
        $lData = $this->mEntityManager->getRepository("WegeooDataLayerBundle:Data")
            ->findOneBy(array("key" => $lRemoteAddr, "type" => "userLocation"));

        if ( count($lData) == 1)
        {
            $lConfiguration = $lData->getValue();
        }else{
            @$lContents = file_get_contents('http://www.geoplugin.net/php.gp?ip='.$lRemoteAddr);

            if ( $lContents !== FALSE)
            {
                $lUserLocalisation = unserialize($lContents);

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

                }else{
                    $this->mLogger->warn("Can not get the user location");
                }
            }else{
                $lConfiguration = FALSE;
            }
        }

        return $lConfiguration;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// GET MOST POPULATED TOWNS
    protected function getMostPopulatedTowns()
    {
        $lViewData = $this->mEntityManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromPopulation(48);
        return $lViewData;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// GET CLASSIFIED URL
    public function getClassifiedURL(Classified $classified , $absolute = FALSE)
    {
        if ( is_null($classified)) return NULL;
        if ( $classified instanceof Classified == FALSE) return NULL;

        /**  HACK to get the postCode and cityName. We should use the slugName directly in the generateURL */
        /** ********************/
        //@TODO modify the way to have postCode and cityName
        preg_match("/([0-9a-zA-Z]*)-([0-9a-zA-Z]*)/", $classified->getCity()->getSlugName() , $lMatches);
        /**  HACK to get the postCode and cityName. We should use the slugName directly in the generateURL */
        /** ********************/
        $lURL = NULL;
        if ( count($lMatches) == 3)
        {
            $lPostCode = $lMatches[1];
            $lCityName = $lMatches[2];

            $lParams = array();
            $lParams["wegeooType"]          = $this->mTranslator->trans($this->mWegeooType, array(), NULL, $classified->getCountryCode());
            $lParams["categoryLocaleName"]  = $this->mTranslator->trans($classified->getCategory(), array(), NULL, $classified->getCountryCode());
            $lParams["cityPostCode"]        = $lPostCode;
            $lParams["cityName"]            = $lCityName;
            $lParams["reference"]           = $classified->getReference();

            $lURL = $this->mRouter->generate("wegeoo_website_classifiedpage", $lParams);
            if ($absolute) {
                $lHost = $this->mContainer->get('request')->getSchemeAndHttpHost();
                $lURL = $lHost . $lURL;
            }
        }else{

        }
        return $lURL;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// FORMAT PRICE
    public function formatPrice($price,$pCountry)
    {
        $lPrice = $price;
        $lFormatter = new \NumberFormatter($pCountry, \NumberFormatter::CURRENCY);
        $lSymbol = $lFormatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL);

        $lNF = new \NumberFormatter($pCountry, \NumberFormatter::DECIMAL);
        $lFormattedPrice = $lNF->format($price);

        switch($lSymbol)
        {
            case "€":   $lPrice = sprintf("%s%s" , $lFormattedPrice , $lSymbol);
                break;
            default:     $lPrice = sprintf("%s%s" , $lSymbol , $lFormattedPrice);
            break;
        }
        return $lPrice;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// SEND ACTIVATION MAIL
    public function sendActivationMail(Classified $classified)
    {
        // Create the Transport
        $lTransport = \Swift_SmtpTransport::newInstance($this->mContainer->getParameter("mailer_host"), 465, 'ssl')
            ->setUsername($this->mContainer->getParameter("mailer_user"))
            ->setPassword($this->mContainer->getParameter("mailer_password"))
        ;

        // Create the Mailer using your created Transport
        $lMailer = \Swift_Mailer::newInstance($lTransport);

        //generate activation URL
        $lClassifiedURLParameters = array();
        $lClassifiedURLParameters["reference"]      = $classified->getReference();
        $lClassifiedURLParameters["activationCode"] = $classified->getActivationCode();

        $lActivationURL = $this->mRouter->generate('wegeoo_website_activation', $lClassifiedURLParameters, true );

        $lParameters = array();
        $lParameters["activationUrl"]   = $lActivationURL;
        $lParameters["classified"]      = $classified;
        $lParameters["classifiedURL"]   = $this->getClassifiedURL($classified , true);
        $lEmailRender = $this->mContainer->get("templating")->render('WegeooDataLayerBundle:email:activationMail.html.twig', $lParameters );
        $this->mLogger->info("lEmailRender:".$lEmailRender);

        //set subject
        $lSubject = sprintf($this->mTranslator->trans("post.mail.activation.subject") , $classified->getTitle());

        //create message
        $lMessage = \Swift_Message::newInstance()
            ->setSubject($lSubject)
            ->setFrom(array($this->mContainer->getParameter("mailer_user") => "Wegeoo Activation Mail"))
            ->setTo($classified->getContact()["email"])
            ->setBody($lEmailRender, 'text/html');

        // Send the message
        $lSuccess = $lMailer->send($lMessage);
        //$lSuccess = $this->get('mailer')->send($lMessage);

        $this->mLogger->info("lSuccess:".var_export($lSuccess,true));
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// COMPUTE DISTANCE
    public function computeDistanceBetweenLatLng($lat1,$lng1,$lat2,$lng2)
    {
        $R = 6371;
        $dLat = deg2rad($lat2-$lat1);
        $dLng = deg2rad($lng2-$lng1);

        $a = sin($dLat/2) * sin($dLat/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng/2) * sin($dLng/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $d = $R * $c * 1000;
        return $d;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// GET SLUGNAME
    public function getSlugName($cityPostCode,$cityName)
    {
        return strtolower(sprintf("%s-%s", $cityPostCode, str_replace(" ", "-", $cityName)));
    }
}