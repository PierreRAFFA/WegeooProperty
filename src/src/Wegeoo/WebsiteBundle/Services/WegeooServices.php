<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 11/11/14
 * Time: 00:19
 */

namespace Wegeoo\WebsiteBundle\Services;


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
    protected $mWegeooType;

    public function __construct(Container $container, Router $router , Logger $logger, Translator $translator , $wegeooType)
    {
        $this->mContainer = $container;
        $this->mRouter = $router;
        $this->mLogger = $logger;
        $this->mTranslator = $translator;
        $this->mWegeooType = $wegeooType;
    }
    public function getClassifiedURL(Classified $classified , $absolute = FALSE)
    {
        if ( is_null($classified)) return NULL;
        if ( $classified instanceof Classified == FALSE) return NULL;

        $lParams = array();
        $lParams["wegeooType"]          = $this->mTranslator->trans( $this->mWegeooType, array() , NULL , $classified->getCountryCode());
        $lParams["categoryLocaleName"]  = $this->mTranslator->trans($classified->getCategory() , array() , NULL , $classified->getCountryCode());
        $lParams["cityPostCode"]        = strtolower($classified->getCity()->getPostCode());
        $lParams["cityName"]            = strtolower(str_replace(" " , "-" , $classified->getCity()->getUppercaseName()));
        $lParams["reference"]           = $classified->getReference();

        $lURL = $this->mRouter->generate("wegeoo_website_classifiedpage", $lParams);
        if ( $absolute)
        {
            $lHost = $this->mContainer->get('request')->getSchemeAndHttpHost();
            $lURL = $lHost . $lURL;
        }

        return $lURL;
    }
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


    public function getSlugName($cityPostCode,$cityName)
    {
        return strtolower(sprintf("%s-%s", $cityPostCode, str_replace(" ", "-", $cityName)));
    }

}