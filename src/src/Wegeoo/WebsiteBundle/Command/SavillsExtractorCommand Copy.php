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

class SavillsExtractorCommand extends ContainerAwareCommand
{
    const GOOGLE_GEOCODE_URL = "http://maps.google.com/maps/api/geocode/json?sensor=false&address=%s";

    /**
     * @var OutputInterface
     */
    protected $mOutput;

    protected $mData = array();

    protected $mNumClassifiedsAdded = 0;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        $this->setName("website:rss:savills:extractold")
            ->setDescription("Extracts data from Savills RSS and populates the Wegeoo database.");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////// EXECUTE
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->mOutput = $output;

        $this->buildSaleURLs();

        $this->buildRentURLs();

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function buildSaleURLs()
    {
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
                //$lTownURL = 'http://search.savills.com/rss/property-for-sale/england/central-london';
                //$lTownURL = 'http://search.savills.com/rss/property-for-sale/england/camden-borough';

                $this->downloadRSS($lTownURL , "sale");
            }
        }else{
            $this->mOutput->writeln("An error occurs when trying to get all town URLs. Maybe the html page has changed.");
        }
        //$this->mOutput->writeln(var_export($lMatches,true));
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function buildRentURLs()
    {
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
                //$lTownURL = 'http://search.savills.com/rss/property-for-sale/england/central-london';
                //$lTownURL = 'http://search.savills.com/rss/property-for-sale/england/camden-borough';

                $this->downloadRSS($lTownURL , "rent");
            }
        }else{
            $this->mOutput->writeln("An error occurs when trying to get all town URLs. Maybe the html page has changed.");
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function downloadRSS($url , $type)
    {
        $this->mOutput->writeln("Extracting from '$url'...");
        $lDoctrineManager = $this->getContainer()->get("doctrine")->getManager();

        $lRSS = simplexml_load_file($url);

        $lNamespaces = $lRSS->getNameSpaces(true);

        $lItemXMLs = $lRSS->xpath("//item");

//        <guid isPermaLink="false">gbcorscbs140226</guid>
//			<link>http://search.savills.com/property-detail/gbcorscbs140226</link>
//			<title>Pachesham Park, Leatherhead, Surrey, KT22 0DJ</title>
//			<description>Guide price £4,950,000 . &lt;div&gt;&lt;img src="http://search.savills.com/content/assets/properties/gbcorscbs140226/CBS140226_01_lis.JPG" /&gt;&lt;/div&gt;</description>
//			<a10:updated>2014-11-20T10:33:33Z</a10:updated>

        $lItemAdded = 0;
        $lItemAlreadyExists = 0;
        foreach($lItemXMLs as $lItemXML)
        {
            $lSavillsId     = (string) $lItemXML->guid;
            $lTitle         = (string) $lItemXML->title;
            $lDescription   = (string) $lItemXML->description;
            $lLink          = (string) $lItemXML->link;// Savills RSS bug !!
            $lLink          = sprintf("http://search.savills.com/property-detail/%s" , $lSavillsId);

            $lReference = "sv-" . $lSavillsId;

            $lClassifieds = $lDoctrineManager->getRepository("WegeooDataLayerBundle:Classified")->findByReference($lReference);

            if ( count($lClassifieds) == 0)
            {
                //$this->mOutput->writeln($lDescription);
                //$this->mOutput->writeln("=============================");
                //$this->mOutput->writeln($lTitle);
                //$this->mOutput->writeln($lLink);

                $lDetails = NULL;

                //get price from description
                $lPrice = NULL;
                preg_match("/£([,0-9]*)/" , $lDescription , $lMatches);
                if (count($lMatches) == 2)
                {
                    $lPrice = $lMatches[1];
                    $lPrice = str_replace("," , "" , $lPrice);
                    $lDetails["price"] = $lPrice;
                }else{
                    $this->mOutput->writeln("WARNING: No price found in the description '$lDescription'");
                }

                //get media
                $lExternalMedias = NULL;
                preg_match('/img src="(.*)"/' , $lDescription , $lMatches);
                //$this->mOutput->writeln(var_export($lMatches,true));
                if (count($lMatches) == 2)
                {
                    $lExternalMedias = array(trim($lMatches[1]));
                }else {
                    $this->mOutput->writeln("WARNING: No media found in the title '$lDescription'");
                }

                //get high media
                $lCrawler = new Crawler(file_get_contents($lLink));
                $lSrc2 = $lCrawler->filterXPath("//div[@u='slides']/div/img[@u='image']")->attr("src2");
                //$this->mOutput->writeln("lSrc2:".var_export($lSrc2,true));
                $lExternalMedias = array($lSrc2);

                //get description
                //$lDescription = preg_replace("/<div>/" , '<div style="position:relative; float:left;">' , $lDescription);
                $lDescription = preg_replace("/<div>.*<\/div>/" , '' , $lDescription);

                //get code
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
                        $this->mOutput->writeln("WARNING: No code found in the postCode '$lPostCode'");
                    }
                }else {
                    $this->mOutput->writeln("WARNING: No postCode found in the title '$lTitle'");
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
                    $this->mOutput->writeln("WARNING: No city found in the title '$lTitle'");
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
                    $this->mOutput->writeln("WARNING: No city found in the title '$lTitle'");
                }

                //get city
                if ( $lCode && ($lFirstCityName || $lSecondCityName || $lThirdCityName))
                {
                    //test first and second cityName
                    $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode,$lFirstCityName);
//                    $this->mOutput->writeln("1:".var_export($lCities,true));
                    if (count($lCities) == 0)
                        $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode,$lSecondCityName);
//                    $this->mOutput->writeln("2:".var_export($lCities,true));
                    if ($lThirdCityName && count($lCities) == 0)
                        $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode,$lThirdCityName);
//                    $this->mOutput->writeln("3:".var_export($lCities,true));
//                    $this->mOutput->writeln("3:".var_export($lCode,true));
//                    $this->mOutput->writeln("3:".var_export($lThirdCityName,true));
//                    if (count($lCities) == 0)
//                        $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCityFromDivision($lFirstCityName);
//
//                    if (count($lCities) == 0)
//                        $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCityFromDivision($lSecondCityName);
//
//                    if (count($lCities) == 0)
//                        $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCityFromDivision($lThirdCityName);
                    if (count($lCities) == 0)
                    {
                        $lCityInformations = $this->getCityInformationsFromPostCode($lPostCode);
                        //$this->mOutput->writeln("Ultimate test with:".var_export($lCityInformations,true));
                        //$this->mOutput->writeln($lCode);
                        $lCities = $lDoctrineManager->getRepository("WegeooDataLayerBundle:City")->getCitiesFromCodeAndName($lCode, $lCityInformations["name"]);
                    }
                    //$this->mOutput->writeln(var_export($lCities,true));

                    if ( count($lCities) == 1)
                    {
                        //get latitude, longitude
                        $lGeolocalized = TRUE;
                        $url = 'http://search.savills.com/detail/mapproperty';

                        //open connection
                        $ch = \curl_init();

                        //set the url, number of POST vars, POST data
                        \curl_setopt($ch,CURLOPT_URL, $url);
                        \curl_setopt($ch,CURLOPT_POST, 1);
                        \curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
                        \curl_setopt($ch,CURLOPT_POSTFIELDS, "ExternalPropertyID=$lSavillsId");

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
                        }else{
                            //$lLatLng = $this->getCityInformationsFromPostCode($lPostCode);
                            $lGeolocalized = FALSE;
                        }

                        $lContact = array();
                        $lContact["logo"] = "http://www.savills.co.uk/_images/logo_savills.gif";

                        //create classified
                        $lCity = $lCities[0];
                        //$this->mOutput->writeln($lCity->getName());

                        $lClassified = new Classified();
                        $lClassified->setReference("sv-".$lSavillsId);
                        $lClassified->setCategory($type);
                        $lClassified->setClientIp("savills");
                        $lClassified->setCreationDate(new \DateTime());
                        $lClassified->setModificationDate(new \DateTime());
                        $lClassified->setTitle($lTitle);
                        $lClassified->setDescription($lDescription);
                        $lClassified->setDetails($lDetails);
                        $lClassified->setCountryCode("gb");
                        $lClassified->setCity($lCity);
                        $lClassified->setLatitude($lLatLng["lat"]);
                        $lClassified->setLongitude($lLatLng["lng"]);
                        $lClassified->setExternalLink($lLink);
                        $lClassified->setExternalMedias($lExternalMedias);
                        $lClassified->setActive(true);
                        $lClassified->setContact($lContact);
                        $lClassified->setGeolocalized($lGeolocalized);

                        //save in db
                        $lDoctrineManager ->persist($lClassified);
                        $lDoctrineManager->flush();

                        $lItemAdded++;
                    }else if ( count($lCities) > 1){
                        $this->mOutput->writeln("WARNING: More than one city found for the code '$lCode' and city '$lFirstCityName/$lSecondCityName/$lThirdCityName'");
                    }else{
                        $this->mOutput->writeln("WARNING: No city found for the code '$lCode' and city '$lFirstCityName/$lSecondCityName/$lThirdCityName'");
                    }

                }else{
                    $this->mOutput->writeln("WARNING:Ignored Item:'$lTitle'");
                }
            }else{
                $lItemAlreadyExists++;
            }
        }
        if ( count($lItemXMLs))
        {
            $this->mOutput->writeln(sprintf("RESULT: %s/%s classified added (%s%%)" , $lItemAdded , count($lItemXMLs) , $lItemAdded / count($lItemXMLs) * 100));
            $this->mOutput->writeln(sprintf("        %s/%s already exists (%s%%)" , $lItemAlreadyExists , count($lItemXMLs) , $lItemAlreadyExists / count($lItemXMLs) * 100));
        }else{
            $this->mOutput->writeln(sprintf("RESULT: 0 classified in the rss"));
        }
        $this->mOutput->writeln("===============================");
    }

    protected function getExternalMedias($itemXML)
    {
        $lExternalMedias = array();

        $lDescription = (string) $itemXML->description;

        $lCrawler = new Crawler($lDescription);
        $lExternalMedias = $lCrawler
            ->filter("img")
            ->each(function ($node, $i)
            {
                return $node->attr("src");
            });

        //$this->mOutput->writeln(var_export($lExternalMedias,true));

        return $lExternalMedias;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function getCityInformationsFromPostCode($postCode)
    {
        //find postCode geolocation
        $lDoctrineManager = $this->getContainer()->get("doctrine")->getManager();
        $lDatas = $lDoctrineManager->getRepository("WegeooDataLayerBundle:Data")->findBy(array("key" => $postCode, "type" => "postCodeGeocode"));

        if ( count($lDatas) == 1)
        {
            $lValue = ($lDatas[0]->getValue());
        }else{
            $lURL = sprintf(self::GOOGLE_GEOCODE_URL , urlencode($postCode));
            //$this->mOutput->writeln("lURL:".$lURL);

            $lContents = file_get_contents($lURL);
            $lResults = json_decode($lContents , true);
            sleep(1);// to prevent bans by google

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
                $lDoctrineManager->persist($lData);
                $lDoctrineManager->flush();

            }else{
                $this->mOutput->writeln("lURL:".$lURL);
                $this->mOutput->writeln("lContents:".var_export($lContents,true));
                die();
            }
        }

        return $lValue;
    }
}