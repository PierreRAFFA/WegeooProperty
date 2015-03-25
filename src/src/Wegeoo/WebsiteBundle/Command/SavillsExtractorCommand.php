<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 02/12/14
 * Time: 23:11
 */

namespace Wegeoo\WebsiteBundle\Command;


use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DomCrawler\Crawler;
use Wegeoo\DataLayerBundle\Entity\Classified;
use Wegeoo\DataLayerBundle\Entity\Data;
use Wegeoo\WebsiteBundle\Form\DataTransformer\CityToIdTransformer;

class SavillsExtractorCommand extends ExtractorCommand
{
    const PREFIX_ID = "sv-";

    protected $mCurrentLatLng;

    protected $mLogo;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        ExtractorCommand::$DEBUG = false;

        $this->setName("website:rss:savills:extract")
            ->setDescription("Extracts data from Savills RSS and populates the Wegeoo database.");

        parent::configure();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function buildSaleURLs()
    {
        parent::buildSaleURLs();

        $lRSSBaseURL = "http://search.savills.com/rss";

        //get main page
        $lMainPage = "http://search.savills.com/property-for-sale/uk";
        $lMainPageContents = file_get_contents($lMainPage);

        //extract all town URLs
        preg_match_all('/<a href="\/list(\/[\-0-9a-zA-Z]*\/[\-0-9a-zA-Z]*\/[\-0-9a-zA-Z]*)"/' , $lMainPageContents , $lMatches);
        if ( count($lMatches) == 2)
        {
            $lTownURLs = $lMatches[1];
            //$lTownURLs = array($lTownURLs[2]);
            foreach($lTownURLs as $lTownURL)
            {
                $lTownURL = $lRSSBaseURL . $lTownURL;

                $this->downloadAndParseItems($lTownURL , "sale");
            }
        }else{
            $this->mOutput->writeln("An error occurs when trying to get all town URLs. Maybe the html page has changed.");
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function buildRentURLs()
    {
        parent::buildRentURLs();

        $lRSSBaseURL = "http://search.savills.com/rss";

        //get main page
        $lMainPage = "http://search.savills.com/property-to-rent/uk";
        $lMainPageContents = file_get_contents($lMainPage);

        //extract all town URLs
        preg_match_all('/<a href="\/list(\/[\-0-9a-zA-Z]*\/[\-0-9a-zA-Z]*\/[\-0-9a-zA-Z]*)"/' , $lMainPageContents , $lMatches);
        if ( count($lMatches) == 2)
        {
            $lTownURLs = $lMatches[1];
            //$lTownURLs = array($lTownURLs[2]);
            foreach($lTownURLs as $lTownURL)
            {
                $lTownURL = $lRSSBaseURL . $lTownURL;

                $this->downloadAndParseItems($lTownURL , "rent");
            }
        }else{
            $this->mOutput->writeln("An error occurs when trying to get all town URLs. Maybe the html page has changed.");
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function parseItems($rss , $category)
    {
        //$lNamespaces = $lRSS->getNameSpaces(true);

        $this->mLogo = "http://www.savills.co.uk/_images/logo_savills.gif";

        $lItemXMLs = $rss->xpath("//item");
        foreach($lItemXMLs as $lItemXML)
        {
            $this->parseItem($lItemXML,$category,true);
        }
    }

    protected function getReference($itemXML)
    {
        return self::PREFIX_ID . (string) $itemXML->guid;
    }
    protected function getLink($itemXML)
    {
        $lLink          = (string) $itemXML->link;// Savills RSS bug !!
        $lLink          = sprintf("http://search.savills.com/property-detail/%s" , (string) $itemXML->guid);
        return $lLink;
    }
    protected function getCity($itemXML)
    {
        $lCity = NULL;

        $lDoctrineManager = $this->getContainer()->get("doctrine")->getManager();

        $lTitle = $this->getTitle($itemXML);

        $lCode = NULL;
        $lPostCode = NULL;
        preg_match("/,([ 0-9a-zA-Z]*)$/" , $lTitle , $lMatches);
        if (count($lMatches) == 2)
        {
            $lPostCode = trim($lMatches[1]);
            $lExploded = explode(" " , $lPostCode);
            if ( count($lExploded) == 2)
            {
                $lCode = $lExploded[0];
            }else{
                $this->warn("No code found in the postCode '$lPostCode'");
            }
        }else {
            $this->warn("No postCode found in the title '$lTitle'");
        }

        //get cityName ( first proposition )
        $lFirstCityName = NULL;
        $lTownInfos = str_getcsv($lTitle , ",");

        $lFirstCityName = trim($lTownInfos[1]);
        $lFirstCityName = strtoupper($lFirstCityName);
        $lFirstCityName = str_replace("BY " , "" , $lFirstCityName );

        $lSecondCityName = NULL;
        if ( count($lTownInfos) >= 3) {
            $lSecondCityName = trim($lTownInfos[2]);
            $lSecondCityName = strtoupper($lSecondCityName);
            $lSecondCityName = str_replace("BY ", "", $lSecondCityName);
        }

        $lThirdCityName     = NULL;
        if ( count($lTownInfos) >= 4)
        {
            $lThirdCityName = trim($lTownInfos[3]);
            $lThirdCityName = strtoupper($lThirdCityName);
            $lThirdCityName = str_replace("BY " , "" , $lThirdCityName );
        }


        //preg_match("/^[& 0-9a-zA-Z]*,([& 0-9a-zA-Z]*)/" , $lTitle , $lMatches);
        preg_match("/^[^,]*,([^,]*)/" , $lTitle , $lMatches);
        //  $this->mOutput->writeln(var_export($lMatches,true));
        if (count($lMatches) == 2)
        {
            $lFirstCityName = trim($lMatches[1]);
            $lFirstCityName = strtoupper($lFirstCityName);
            $lFirstCityName = str_replace("BY " , "" , $lFirstCityName );
        }else{
            $this->warn("No city found in the title '$lTitle'");
        }

        //get cityName ( second proposition )
        $lSecondCityName = NULL;
        preg_match("/^[^,]*,[^,]*,([^,]*)/" , $lTitle , $lMatches);
        //$this->mOutput->writeln(var_export($lMatches,true));
        if (count($lMatches) == 2)
        {
            $lSecondCityName = trim($lMatches[1]);
            $lSecondCityName = strtoupper($lSecondCityName);
            $lSecondCityName = str_replace("BY " , "" , $lSecondCityName );
        }else{
            $this->warn("No city found in the title '$lTitle'");
        }

        //get city
        if ( $lCode && ($lFirstCityName || $lSecondCityName || $lThirdCityName)) {
            //test first and second cityName
            $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode, $lFirstCityName);

            if (count($lCities) == 0)
                $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode, $lSecondCityName);

            if ($lThirdCityName && count($lCities) == 0)
                $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode, $lThirdCityName);

            if (count($lCities) == 0) {
                $lCityInformations = $this->getCityInformationsFromPostCode($lPostCode);
                //$this->mOutput->writeln("Ultimate test with:".var_export($lCityInformations,true));
                //$this->mOutput->writeln($lCode);
                $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode, $lCityInformations["name"]);
            }
            if ( count($lCities) == 1)
            {
                $lCity = $lCities[0];
            }
        }

        return $lCity;
    }
    protected function getTitle($itemXML)
    {
        return (string) $itemXML->title;
    }
    protected function getDescription_($itemXML)
    {
        $lDescription = (string) $itemXML->description;
        $lDescription = preg_replace("/<div>.*<\/div>/" , '' , $lDescription);

        return $lDescription;
    }
    protected function getLatLng($itemXML)
    {
        $lText = $this->mCrawler->text();

        $url = 'http://search.savills.com/detail/mapproperty';

        //open connection
        $ch = \curl_init();

        //set the url, number of POST vars, POST data
        \curl_setopt($ch,CURLOPT_URL, $url);
        \curl_setopt($ch,CURLOPT_POST, 1);
        \curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
        \curl_setopt($ch,CURLOPT_POSTFIELDS, sprintf("ExternalPropertyID=%s" , (string) $itemXML->guid));

        //execute post
        $result = \curl_exec($ch);

        //close connection
        \curl_close($ch);

        preg_match("/detailMap\[([-\.0-9]*)\),([-\.0-9]*)\]/" , $result , $lMatches);
        //$this->mOutput->writeln(var_export($lMatches,true));
        if ( count($lMatches) == 3)
        {
            $lLat = $lMatches[1];
            $lLng = $lMatches[2];
            $lLatLng = array("lat" => $lLat , "lng" => $lLng);
            $this->mCurrentLatLng = $lLatLng;
        }

        return $lLatLng;
    }

    protected function getDetails($itemXML,$category)
    {
        $lDetails = array();

        //get price from description
        $lDescription = $this->getDescription_($itemXML);

        if ( $category == "rent")
        {
            preg_match("/£([,0-9]*) (monthly|weekly)/" , $lDescription , $lMatches);
            if (count($lMatches) == 3)
            {
                $lPrice = $lMatches[1];
                $lPrice = str_replace("," , "" , $lPrice);

                $lTime = $lMatches[2];
                if ($lTime ==  "monthly")
                {
                    $lDetails["monthPrice"] = $lPrice;
                    $lDetails["weekPrice"]  = intval($lPrice / (13/3));
                    $lDetails["price"]      = $lDetails["monthPrice"];
                }else if ($lTime ==  "weekly")
                {
                    $lDetails["weekPrice"]  = $lPrice;
                    $lDetails["monthPrice"] = intval($lPrice * (13/3));
                    $lDetails["price"]      = $lDetails["monthPrice"];
                }

            }else{
                $this->warn("No price found in the description '$lDescription'");
            }
        }else if ($category == "sale")
        {
            preg_match("/£([,0-9]*)/" , $lDescription , $lMatches);
            if (count($lMatches) == 2)
            {
                $lPrice = $lMatches[1];
                $lPrice = str_replace(",", "", $lPrice);
                $lDetails["price"]  = $lPrice;
            }
        }

        //get property type from description
        $lDescriptionParagraph = $this->mCrawler->filterXPath("//div[@id='property-detail-description-right']/p");

        if($lDescriptionParagraph->count())
        {
            $lDescription   = $lDescriptionParagraph->text();
            $lIsApartment   = strpos($lDescription , Classified::TYPE_APARTMENT) !== FALSE;
            $lIsHouse       = strpos($lDescription , Classified::TYPE_HOUSE) !== FALSE || strpos($lDescription , "home") !== FALSE;

            if ( $lIsApartment )
                $lDetails["propertyType"] = Classified::TYPE_APARTMENT;
            else if ( $lIsHouse )
                $lDetails["propertyType"] = Classified::TYPE_HOUSE;
        }else{
            $this->warn("No propertyType because the classified does not have any description (Crawler)");
        }



        //get other details
        $lLis = $this->mCrawler->filterXPath("//ul[@class='summary']/li")
            ->each(function($node, $i)
            {
                return $node->text();
            });

        //$this->notice("lLis:".var_export($lLis,true));

        foreach($lLis as $lLi)
        {
            preg_match("/([0-9]*) .*?bedrooms?/i" , $lLi , $lMatches);
            if ( count($lMatches) == 2)
            {
                if ( $lMatches[1] != "")
                    $lDetails["numBedrooms"] = $lMatches[1];
            }

            if ( $lLi == "Unfurnished")
                $lDetails["furnished"] = FALSE;
        }

        //$this->notice(var_export($lDetails,true));

        return $lDetails;
    }
    protected function getContact($itemXML)
    {
        $lContact = array();

        //Logo
        if ( $this->mLogo)
            $lContact["logo"] = $this->mLogo;

        return $lContact;
    }
    protected function getExternalMedias($itemXML)
    {
        //1st method
        $lExternalMedias = NULL;
        preg_match('/img src="(.*)"/' , $this->getDescription_($itemXML) , $lMatches);
        if (count($lMatches) == 2) {
            $lExternalMedias = array(trim($lMatches[1]));
        }

        //2nd method
        $lSrc2 = $this->mCrawler->filterXPath("//div[@u='slides']/div/img[@u='image']")->attr("src2");
        //$this->notice("lSrc2:".var_export($lSrc2,true));
        return array($lSrc2);
    }
}