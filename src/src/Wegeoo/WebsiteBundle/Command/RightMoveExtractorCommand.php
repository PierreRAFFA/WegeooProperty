<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 06/12/14
 * Time: 00:18
 */

namespace Wegeoo\WebsiteBundle\Command;


use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DomCrawler\Crawler;
use Wegeoo\DataLayerBundle\Entity\Classified;

class RightMoveExtractorCommand extends ExtractorCommand
{
    const PREFIX_ID = "rm-";

    protected $mCurrentLatLng;

    protected $mLogo;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        ExtractorCommand::$DEBUG = false;

        $this->setName("website:rss:rightmove:extract")
            ->setDescription("Extracts data from RightMove RSS and populates the Wegeoo database.");

        parent::configure();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function buildSaleURLs()
    {
        parent::buildSaleURLs();

        $lBaseURL = "http://www.rightmove.co.uk/rss/property-for-sale/find.html?locationIdentifier=REGION%%5E%s";

        for($iId = 87490 ; $iId <= 90000 ; $iId++)
        {
            $lURL = sprintf($lBaseURL ,$iId);

            $this->downloadAndParseItems($lURL , "sale");
        }
        for($iId = 1 ; $iId <= 87490 ; $iId++)
        {
            $lURL = sprintf($lBaseURL ,$iId);

            $this->downloadAndParseItems($lURL , "sale");
        }

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function buildRentURLs()
    {
        parent::buildRentURLs();

        $lBaseURL = "http://www.rightmove.co.uk/rss/property-to-rent/find.html?locationIdentifier=REGION%%5E%s";

        for($iId = 87490 ; $iId <= 90000 ; $iId++)
        {
            $lURL = sprintf($lBaseURL ,$iId);

            $this->downloadAndParseItems($lURL , "rent");
        }
        for($iId = 1 ; $iId <= 87490 ; $iId++)
        {
            $lURL = sprintf($lBaseURL ,$iId);

            $this->downloadAndParseItems($lURL , "rent");
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function parseItems($rss , $category)
    {
        //$lNamespaces = $lRSS->getNameSpaces(true);

        $this->mLogo = (string) $rss->channel->image->url;

        $lItemXMLs = $rss->xpath("//item");
        foreach($lItemXMLs as $lItemXML)
        {
            $this->parseItem($lItemXML,$category,true);
        }
    }
    protected function getReference($itemXML)
    {
        $lReference = NULL;
        if ( isset($itemXML->guid))
        {
            $lGuid = (string) $itemXML->guid;

            preg_match("/property-([0-9]*).html/" , $lGuid , $llMatches);
            if (count($llMatches) == 2)
            {
                $lId = $llMatches[1];
                $lReference = self::PREFIX_ID . $lId;
                //$this->notice($lReference);
            }
        }

        return $lReference;
    }
    protected function getCity($itemXML)
    {
        $lCity = NULL;

        $this->mCurrentLatLng = NULL;

        $lTitle = (string) $itemXML->title;
        $lTitle = preg_replace("/\n/" , " " , $lTitle);
        $lTitle = preg_replace("/\t/" , " " , $lTitle);

        //$this->notice("lTitle:".$lTitle);

        $lExplodedTitle = explode(":" , $lTitle);
//        $this->notice("-----------------------------------");
//        $this->notice("-----------------------------------");
//        $this->notice("lTitle:".var_export($lExplodedTitle,true));
        if (count($lExplodedTitle) == 3)
        {
            $lCityInfos = trim($lExplodedTitle[2]);
            $lExplodedCityInfos = explode("," , $lCityInfos);

            $lInfoLast1 = trim($lExplodedCityInfos[count($lExplodedCityInfos)-1]);



//            $this->notice(var_export($lExplodedCityInfos,true));
            if ( count($lExplodedCityInfos) >= 3 )
            {
                $lInfoLast2 = trim($lExplodedCityInfos[count($lExplodedCityInfos)-2]);
                $lInfoLast3 = trim($lExplodedCityInfos[count($lExplodedCityInfos)-3]);

//                $this->notice("lInfoLast1:".$lInfoLast1);
//                $this->notice("lInfoLast2:".$lInfoLast2);
//                $this->notice("lInfoLast3:".$lInfoLast3);
//                $this->notice("1");

                $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
                    ->getCitiesFromCodeAndName($lInfoLast1,strtoupper($lInfoLast2));
//                $this->notice("count(lCities):".var_export($lCities,true) );
//                $this->notice("count(lCities):".count($lCities) );
                if ( count($lCities) != 1)
                {
//                    $this->notice("2");
                    $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
                        ->getCitiesFromCodeAndName($lInfoLast1,strtoupper($lInfoLast3));
                }
//                $this->notice("count(lCities):".count($lCities) );
                if ( count($lCities) != 1)
                {
//                    $this->notice("3");
//                    $this->notice("3rd:".strtoupper(trim($lExplodedCityInfos[count($lExplodedCityInfos)-1])));
                    $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
                        ->findByUppercaseName(strtoupper($lInfoLast1));
                }
//                $this->notice("count(lCities):".count($lCities) );
                if ( count($lCities) != 1)
                {
//                    $this->notice("4");
                    $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
                        ->getCitiesFromCodeAndDivision($lInfoLast1,strtoupper($lInfoLast2));

                    //we take the first one event if the result is not precise
                    if ( count($lCities))
                        $lCities = array($lCities[0]);
                }
//                $this->notice("count(lCities):".count($lCities) );
            }else{
//                $this->notice("5");
//                $this->notice("1b:".strtoupper(trim($lExplodedCityInfos[count($lExplodedCityInfos)-1])));
                $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")
                    ->findByUppercaseName(strtoupper($lInfoLast1));
            }

            if ( count($lCities) == 1)
            {
                $lCity = $lCities[0];
                if (is_null($this->mCurrentLatLng))
                    $this->mCurrentLatLng = array("lat" => $lCity->getLatitude() , "lng" => $lCity->getLongitude());

            }else{
//                $lGoogleCityInformations = $this->getCityInformationsFromString($lCityInfos);
//                if ( isset($lGoogleCityInformations["latLng"]))
//                    $this->mCurrentLatLng = $lGoogleCityInformations["latLng"];
//
//                if (isset($lGoogleCityInformations["city"]))
//                {
//                    $lCity = $lGoogleCityInformations["city"];
//                }else{
//                }
            }
        }

        return $lCity;
    }
    protected function getLatLng($itemXML)
    {
        $lText = $this->mCrawler->text();

        preg_match('/"latitude":([-\.0-9]*),"longitude":([-\.0-9]*)/' , $lText , $lMatches );

        if ( count($lMatches) == 3)
        {
            $lLat = $lMatches[1];
            $lLng = $lMatches[2];

            $this->mCurrentLatLng = array("lat" => $lLat , "lng" => $lLng);
            //$this->notice(var_export($this->mCurrentLatLng,true));
        }else{
            $this->mCurrentLatLng = NULL;
            $this->notice("no match");
            $this->notice($this->getLink($itemXML));
            //$this->notice($this->mCrawler->text());
        }

        return $this->mCurrentLatLng;
    }
    protected function getTitle($itemXML)
    {
        $lTitle = (string) $itemXML->title;
        $lTitle = preg_replace("/\n/" , " " , $lTitle);
        $lTitle = preg_replace("/\t/" , " " , $lTitle);

        $lExplodedTitle = explode(":" , $lTitle);

        if (count($lExplodedTitle) == 3)
            $lTitle = sprintf("%s, %s" , trim($lExplodedTitle[1]) , trim($lExplodedTitle[2])) ;

        return $lTitle;
    }
    protected function getDetails($itemXML,$category)
    {
        $lDetails = array();

        //price
        $lTitle = (string) $itemXML->title;
        $lTitle = preg_replace("/\n/" , " " , $lTitle);
        $lTitle = preg_replace("/\t/" , " " , $lTitle);
        $this->notice("lTitle:".$lTitle);

        //price
        $lExplodedTitle = explode(":" , $lTitle);
        if (count($lExplodedTitle) > 0)
        {
            $lPrice = trim($lExplodedTitle[0]);
            $lPrice = str_replace("," , "" , $lPrice);

            preg_match("/([0-9]+)/" , $lPrice , $lMatches);
            if ( count($lMatches) == 2)
            {
                $lPrice = $lMatches[1];
                $lDetails["price"] = $lPrice;
            }
        }

        if ( $category == "rent")
        {
            //price more precise
            $lText = $this->mCrawler->filterXPath("//p[@id='propertyHeaderPrice']/strong")->text();
            //$this->notice(var_export($lText,true));

            preg_match("/£([,0-9]+) pw.*£([,0-9]+) pcm/s", $lText , $lMatches);
            //$this->notice(var_export($lMatches,true));

            if (count($lMatches) == 3)
            {
                $lWeekPrice  = str_replace("," , "" , $lMatches[1]);
                $lMonthPrice = str_replace("," , "" , $lMatches[2]);

                $lDetails["weekPrice"]  = $lWeekPrice;
                $lDetails["monthPrice"] = $lMonthPrice;
                $lDetails["price"]      = $lMonthPrice;
            }else{
                $this->notice("POA detected");
                $this->notice($this->getLink($itemXML));
                $lDetails["price"] = "-1";
            }
        }

        //num bedrooms
        preg_match("/([0-9]+) bedroom/" , $lTitle , $lMatches);
        $this->notice(var_export($lMatches,true));
        if ( count($lMatches) == 2)
        {
            $lDetails["numBedrooms"] = $lMatches[1];
        }

        //numRooms for studio only. numBedrooms is not set because it's perhaps a studio
        if ( isset($lDetails["numBedrooms"]) == FALSE)
        {
            preg_match("/studio/i" , $lTitle , $lMatches);
            if ( count($lMatches) == 1)
            {
                $lDetails["numRooms"] = 1;
                $lDetails["numBedrooms"] = 0;
            }
        }

        //property type
        $lCategory = (string) $itemXML->category;
        switch(strtolower($lCategory))
        {
            case "apartment":
            case "flat share":
            case "studio apartment":
            case "ground floor flat":
            case "flat":
            case "duplex":
            case "studio flat":
                $lDetails["propertyType"] = Classified::TYPE_APARTMENT;
                break;

            case "house":
            case "park home":
            case "guest house":
            case "villa":
            case "penthouse":
            case "mews house":
            case "link detached house":
            case "detached villa":
            case "chalet":
            case "town house":
            case "cluster house":
            case "property":
            case "character property":
            case "retirement property":
            case "cottage":
            case "detached house":
            case "semi-detached house":
            case "semi-detached villa":
            case "end of terrace house":
            case "maisonette":
            case "house share":
            case "country house":
            case "stone house":
            case "terraced house":
            case "coach house":
            case "ground maisonette":

                $lDetails["propertyType"] = Classified::TYPE_HOUSE;
                break;

            case "commercial property":
            case "heavy industrial":
            case "light industrial":
                $lDetails["propertyType"] = Classified::TYPE_COMMERCIAL_SPACE;
                break;

            case "bungalow":
            case "terraced bungalow":
            case "mobile home":
            case "farm house":
            case "detached bungalow":
            case "semi-detached bungalow":
            case "barn conversion":
            case "residential development":
            case "farm":
            case "serviced apartment":
            case "showroom":
            case "equestrian facility":
            case "healthcare facility":
            case "warehouse":
            case "lodge":
            case "retail property (high street)":
            case "smallholding":
            case "factory":
            case "farm land":
            case "convenience store":
            case "distribution warehouse":
            case "block of apartments":
            case "post office":
            case "bar / nightclub":
            case "commercial development":
            case "workshop & retail space":
            case "hotel room":
                $lDetails["propertyType"] = Classified::TYPE_OTHERS;
                break;

            case "shop":
            case "restaurant":
            case "cafe":
            case "pub":
            case "mixed use":
                $lDetails["propertyType"] = Classified::TYPE_SHOP;
                break;

            case "land":
            case "plot":
                $lDetails["propertyType"] = Classified::TYPE_LAND;
                break;

            case "garage":
            case "parking":
                $lDetails["propertyType"] = Classified::TYPE_PARKING;
                break;

            case "hotel":
                $lDetails["propertyType"] = Classified::TYPE_RESIDENTIAL_BUILDING;
                break;

            case "office":
                $lDetails["propertyType"] = Classified::TYPE_OFFICE;
                break;

            default:
                $this->warn("The propertyType '$lCategory' is unknown'");
                exec("say 'Eh bitch, the property type $lCategory is fucking unknown !'");
                //die();
        }

        $this->notice("lDetails:".var_export($lDetails,true));

        return $lDetails;
    }

    protected function getContact($itemXML)
    {
        $lContact = array();

        $lDescription = (string) $itemXML->description;

        //Contact Phone
        preg_match("/Telephone: ([ 0-9]*)/" , $lDescription , $lMatches);
        //$this->notice(var_export($lMatches,true));
        if ( count($lMatches) == 2)
        {
            $lContact["phone"] = $lMatches[1];
        }

        //Contact Name
        preg_match("/Marketed By (.*)/" , $lDescription , $lMatches);
        //$this->notice("Contact Name:".var_export($lMatches,true));
        if ( count($lMatches) == 2)
        {
            $lExploded = explode("," , $lMatches[1]);

            $lContact["name"]       = trim($lExploded[0]);
            if( count($lExploded) == 2)
            {
                $lContact["address"]    = trim($lExploded[1]);
            }
        }else{
            $this->warn("No Contact Name in the description '$lDescription'");
        }

        //Logo
        if ( $this->mLogo)
            $lContact["logo"] = $this->mLogo;

        //$this->notice(var_export($lContact,true));

        return $lContact;
    }
    protected function getDescription_($itemXML)
    {
        return (string) $itemXML->description;
    }

    protected function getExternalMedias($itemXML)
    {
        $lExternalMedias = array();

        $lDescription = (string) $itemXML->description;

        //get low image
        $lCrawler = new Crawler($lDescription);
        $lExternalLowMedias = $lCrawler
            ->filter("img")
            ->each(function ($node, $i)
            {
                return $node->attr("src");
            });

        //compute high image
        $lSrc = $this->mCrawler->filterXPath("//img[@class='js-gallery-main']")->attr("src");
        $lSrcLow = $lExternalLowMedias[0];
        $lImageSrc = sprintf("%s/%s" , dirname($lSrcLow) , basename($lSrc));
        $lImageSrc = str_replace("co.uk" , "co.uk/dir",$lImageSrc);
        $lExternalMedias[] = $lImageSrc;

        //$this->mOutput->writeln("lExternalMedias:".var_export($lExternalMedias,true));

        return $lExternalMedias;
    }
}