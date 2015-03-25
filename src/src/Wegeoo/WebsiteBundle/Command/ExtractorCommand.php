<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 06/12/14
 * Time: 12:37
 */

namespace Wegeoo\WebsiteBundle\Command;


use Doctrine\ORM\EntityManager;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DomCrawler\Crawler;
use Wegeoo\DataLayerBundle\Entity\City;
use Wegeoo\DataLayerBundle\Entity\Classified;
use Wegeoo\DataLayerBundle\Entity\Data;

abstract class ExtractorCommand extends ContainerAwareCommand
{
    const GOOGLE_GEOCODE_URL = "http://maps.google.com/maps/api/geocode/json?sensor=false&address=%s";

    public static $DEBUG = FALSE;
    /**
     * @var OutputInterface
     */
    protected $mOutput;

    /**
     * @var Crawler
     */
    protected $mCrawler;

    protected $mNumClassifiedsAdded         = 0;
    protected $mNumClassifiedsFound         = 0;
    protected $mNumClassifiedsAlreadyExists = 0;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        $this->addArgument("categories" , InputArgument::OPTIONAL, "sale, rent, both");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////// EXECUTE
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->mOutput = $output;

        $lCategories = $input->getArgument('categories');
        $this->notice(var_export($lCategories,true));

        //sale
        if ( is_null($lCategories) || $lCategories == "both" || $lCategories == "sale")
        {
            $this->buildSaleURLs();
        }

        //rent
        if ( is_null($lCategories) || $lCategories == "both" || $lCategories == "rent")
        {
            $this->buildRentURLs();
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////  BUILD URLS
    protected function buildSaleURLs()
    {
        $this->mOutput->writeln("Building Sale Classifieds URLs...");
    }
    protected function buildRentURLs()
    {
        $this->mOutput->writeln("Building Rent Classifieds URLs...");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////// DOWNLOAD
    protected function downloadAndParseItems($url , $category)
    {
        //init
        $this->mNumClassifiedsAdded = 0;
        $this->mNumClassifiedsFound = 0;
        $this->mNumClassifiedsAlreadyExists = 0;

        //log
        $this->mOutput->writeln("Downloading from '$url'...");

        //download
        @$lRSS = simplexml_load_file($url);
        //$this->notice($lRSS->asXML());

        if ( $lRSS !== FALSE)
        {
            //parse
            $this->parseItems($lRSS,$category);
        }else{
            $this->mOutput->writeln("URL not found");
        }


        //log result
        $this->mOutput->writeln("===============================================");
        if ( $this->mNumClassifiedsFound)
        {
            $this->mOutput->writeln(sprintf("RESULT: %s/%s classified(s) added (%s%%)" , $this->mNumClassifiedsAdded , $this->mNumClassifiedsFound , $this->mNumClassifiedsAdded / $this->mNumClassifiedsFound * 100));
            $this->mOutput->writeln(sprintf("        %s/%s classified(s) already exists (%s%%)" , $this->mNumClassifiedsAlreadyExists , $this->mNumClassifiedsFound , $this->mNumClassifiedsAlreadyExists / $this->mNumClassifiedsFound * 100));
        }else{
            $this->mOutput->writeln(sprintf("RESULT: 0 classified found in the rss"));
        }
        $this->mOutput->writeln("===============================================");
    }
    protected function parseItems($rss,$category)
    {
        /* OVERRIDED */
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////// PARSE AND CONTROLS DATA
    protected function parseItem($itemXML, $category,$useCrawler = FALSE)
    {
        $this->mNumClassifiedsFound++;

        //get reference
        $lReference = $this->getReference($itemXML);

        if ( is_null($lReference) === FALSE)
        {
            //check if already exists.
            $lClassifieds = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:Classified")->findByReference($lReference);

            if ( count($lClassifieds) == 0)
            {
                if ( $useCrawler)
                {
                    @$lLinkContents = file_get_contents($this->getLink($itemXML));
                    if ( $lLinkContents !== FALSE)
                        $this->mCrawler = new Crawler($lLinkContents);
                    else
                    {
                        $this->warn("The Link generates an error. The classified will be ignored");
                        $this->warn("Link:".$this->getLink($itemXML));
                        return;
                    }
                }

                $lCity = $this->getCity($itemXML);

                if (is_null($lCity) === FALSE)
                {
                    $lLatLng = $this->getLatLng($itemXML);

                    if (is_null($lLatLng) === FALSE && isset($lLatLng["lat"]) && isset($lLatLng["lng"]))
                    {
                        $lTitle = $this->getTitle($itemXML) ?: "";
                        $lDescription = $this->getDescription_($itemXML) ?: "";
                        $lDetails = $this->getDetails($itemXML,$category) ?: array();
                        $lLink = $this->getLink($itemXML);
                        $lExternalMedias = $this->getExternalMedias($itemXML);
                        $lDate = $this->getDate($itemXML);
                        $lContact = $this->getContact($itemXML);
                        $lContactType = $this->getContactType($itemXML);

                        $lClassified = new Classified();
                        $lClassified->setReference($lReference);
                        $lClassified->setActive(true);
                        $lClassified->setCategory($category);
                        $lClassified->setClientIp("REMOTE_ADDR");
                        $lClassified->setContactType($lContactType);
                        $lClassified->setContact($lContact);
                        $lClassified->setCreationDate($lDate);
                        $lClassified->setModificationDate(new \DateTime());
                        $lClassified->setTitle($lTitle);
                        $lClassified->setDescription($lDescription);
                        $lClassified->setDetails($lDetails);
                        $lClassified->setCountryCode("TEST");
                        $lClassified->setCity($lCity);
                        $lClassified->setLatitude($lLatLng["lat"]);
                        $lClassified->setLongitude($lLatLng["lng"]);
                        $lClassified->setExternalLink($lLink);
                        $lClassified->setExternalMedias($lExternalMedias);
                        $lClassified->setGeolocalized(TRUE);

                        $this->insert($lClassified);
                    } else {
                        $this->warn("No valid LatLng found.");
                    }
                } else {
                    $this->warn("No City found.");
                }
            }else{
                $this->mNumClassifiedsAlreadyExists++;
            }
        }else{
            $this->warn("No Id found.");
        }
    }
    /**
     * @param $itemXML
     * @return string
     */
    protected function getReference($itemXML)   { return NULL; }
    /**
     * @param $itemXML
     * @return string
     */
    protected function getTitle($itemXML)       { return (string) $itemXML->title; }
    /**
     * @param $itemXML
     * @return string
     */
    protected function getDescription_($itemXML){ return (string) $itemXML->description; }

    /**
     * @param $itemXML
     * @return array
     */
    protected function getDetails($itemXML,$category)     { return NULL; }
    /**
     * @param $itemXML
     * @return City
     */
    protected function getCity($itemXML)        { return NULL; }
    /**
     * @param $itemXML
     * @return array
     */
    protected function getLatLng($itemXML)      { return NULL; }
    /**
     * @param $itemXML
     * @return string
     */
    protected function getLink($itemXML)        { return (string) $itemXML->link; }
    /**
     * @param $itemXML
     * @return array
     */
    protected function getExternalMedias($itemXML){ return NULL; }
    /**
     * @param $itemXML
     * @return array
     */
    protected function getContact($itemXML)     { return NULL; }
    /**
     * @param $itemXML
     * @return \DateTime
     */
    protected function getDate($itemXML)        { return new \DateTime((string) $itemXML->pubDate); }
    /**
     * @param $itemXML
     * @return bool
     */
    protected function getContactType($itemXML) { return "1"; }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////  INSERT
    protected function insert($classified)
    {
        if (self::$DEBUG === FALSE)
        {
            $this->getDoctrine()->persist($classified);
            $this->getDoctrine()->flush();
        }
        $this->mNumClassifiedsAdded++;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////// GET DOCTRINE
    /**
     * @return EntityManager
     */
    protected function getDoctrine()
    {
        return $this->getContainer()->get("doctrine")->getManager();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////// GET CITY FROM POSTCODE
    protected function getCityInformationsFromPostCode($postCode , $alternativeSearch = null)
    {
        $lValue = NULL;
        //find postCode geolocation
        $lDatas = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:Data")->findBy(array("key" => $postCode, "type" => "postCodeGeocode"));

        if ( count($lDatas) == 1)
        {
            $lValue = ($lDatas[0]->getValue());
        }else{
            $lStringSearch = $alternativeSearch ?: $postCode;

            $lURL = sprintf(self::GOOGLE_GEOCODE_URL , urlencode($lStringSearch));

            $lContents = file_get_contents($lURL);
            $lResults = json_decode($lContents , true);

            if ( isset($lResults["error_message"]) == FALSE)
                sleep(1);// to prevent bans by Google API

            $lResults = $lResults["results"];
            if ( count($lResults))
            {
                $lAddress = $lResults[0]["formatted_address"];
                $lAddressArray = str_getcsv($lAddress , ",");

                $lValue = $lResults[0]["geometry"]["location"];
                $lValue["name"] = strtoupper(trim($lAddressArray[0]));

                $lData = new Data();
                $lData->setKey($postCode);
                $lData->setValue($lValue);
                $lData->setType("postCodeGeocode");

                //save data
                $this->getDoctrine()->persist($lData);
                $this->getDoctrine()->flush();

            }else{
                $this->warn("No Results found");
                $this->warn("lContents:".var_export($lContents,true));
            }
        }

        return $lValue;
    }
    protected function getCityInformationsFromString($string)
    {
        $lCityInformations = array();
        $lURL = sprintf(self::GOOGLE_GEOCODE_URL , urlencode($string));

        $lContents = file_get_contents($lURL);
        $lResults = json_decode($lContents , true);

        if ( isset($lResults["error_message"]) == FALSE)
            sleep(1);// to prevent bans by Google API

        $lResults = $lResults["results"];
        if ( count($lResults))
        {
            $lResult = $lResults[0];

            $lPostCode = NULL;
            $lLocality = NULL;
            $lPostalTown = NULL;
            foreach($lResult["address_components"] as $lComponent)
            {
                $lTypes = $lComponent["types"];

                if ( in_array("postal_code" , $lTypes))
                {
                    $lPostCode = $lComponent["long_name"];
                    $lExploded = explode(" " , $lPostCode);
                    $lPostCode = $lExploded[0];
                }
                if ( in_array("locality" , $lTypes))
                {
                    $lLocality = $lComponent["long_name"];
                }
                if ( in_array("postal_town" , $lTypes))
                {
                    $lPostalTown = $lComponent["long_name"];
                }
            }

            if ( $lPostalTown)
                $lLocality = $lPostalTown;


            //$this->notice("postCode:".var_export($lPostCode,true));
            //$this->notice("locality:".var_export($lLocality,true));

            if ( $lPostCode && $lLocality)
            {
                $lCities = $this->getDoctrine()->getRepository("WegeooDataLayerBundle:City")->findBy(array("code" => $lPostCode , "uppercaseName" => strtoupper($lLocality)));

                if ( count($lCities) == 1)
                {
                    $lCityInformations["city"]      = $lCities[0];
                    $lCityInformations["latLng"]    = $lResults[0]["geometry"]["location"];
                }else{
                    //$this->notice("lURL:".$lURL);
                    //$this->notice("lContents:".var_export($lContents,true));
                }
            }else{
                //$this->notice("lURL:".$lURL);
                //$this->notice("lContents:".var_export($lContents,true));
            }
        }else{
            //$this->notice("lURL:".$lURL);
            //$this->notice("lContents:".var_export($lContents,true));
        }

        return $lCityInformations;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////// OUTPUT
    protected function notice($message)
    {
        $this->mOutput->writeln("NOTICE: " . $message);
    }
    protected function warn($message)
    {
        $this->mOutput->writeln("WARNING: " . $message);
    }
    protected function error($message)
    {
        $this->mOutput->writeln("ERROR: " . $message);
    }
}