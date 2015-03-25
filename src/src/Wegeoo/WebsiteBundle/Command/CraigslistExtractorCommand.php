<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 04/12/14
 * Time: 13:13
 */

namespace Wegeoo\WebsiteBundle\Command;


use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DomCrawler\Crawler;

class CraigslistExtractorCommand extends ContainerAwareCommand
{
    const GOOGLE_GEOCODE_URL = "http://maps.google.com/maps/api/geocode/json?sensor=false&address=%s";

    protected $mOutput;

    protected $mData = array();

    protected $mNumClassifiedsAdded = 0;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        $this->setName("website:rss:craigslist:extract")
            ->setDescription("Extracts data from Craigslist RSS and populates the Wegeoo database.");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->mOutput = $output;
        $this->extractSale();
        $this->extractRent();

//        http://london.craigslist.co.uk/search/apa?format=rss
//        http://aberdeen.craigslist.co.uk/search/apa?format=rss
//
//        http://london.craigslist.co.uk/search/rea?format=rss
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function extractSale()
    {
        $lBaseURLs = $this->getBaseURLs();
        $this->mOutput->writeln(var_export($lBaseURLs,true));
        $lBaseURLs = array($lBaseURLs[0]);

        foreach($lBaseURLs as $lBaseURL)
        {
            $lURL = $lBaseURL . "search/rea?format=rss";
            $lURL = 'http://london.craigslist.co.uk/search/rea?format=rss';
            $this->downloadRSS($lURL,"sale");
        }

    }
    protected function extractRent()
    {
        $lBaseURLs = $this->getBaseURLs();


    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////// DOWNLOAD RSS
    protected function downloadRSS($url , $type)
    {
        $this->mOutput->writeln("Extracting from '$url'...");
        $lDoctrineManager = $this->getContainer()->get("doctrine")->getManager();

        $lRSS = simplexml_load_string(utf8_encode(file_get_contents($url)));

        $lNamespaces = $lRSS->getNameSpaces(true);

        $lItems = $lRSS->item;

        $this->mOutput->writeln(var_export(count($lItems),true));

        foreach($lItems as $lItem)
        {
//            <title><![CDATA[Attention Investors!!! HIGH RATES OF RETURN (detroit)]]></title>
//		<link>http://london.craigslist.co.uk/reo/4789937398.html</link>
//		<description><![CDATA[The housing market in Detroit, MI is booming!!! I have a large inventory of tenanted properties for sale with management company in place. These properties have ROI's of 17% to 25%. It you're interested in investing in our very lucrative real estate  [...]]]></description>
//		<dc:date>2014-12-04T16:53:08+00:00</dc:date>
//		<dc:language>en-us</dc:language>
//		<dc:rights>&amp;copy; 2014 &lt;span class="desktop"&gt;craigslist&lt;/span&gt;&lt;span class="mobile"&gt;CL&lt;/span&gt;</dc:rights>
//		<dc:source>http://london.craigslist.co.uk/reo/4789937398.html</dc:source>
//		<dc:title><![CDATA[Attention Investors!!! HIGH RATES OF RETURN (detroit)]]></dc:title>
//		<dc:type>text</dc:type>
//		<dcterms:issued>2014-12-04T16:53:08+00:00</dcterms:issued>


        }

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////// GET BASE URLs
    protected function getBaseURLs()
    {
        $lURL = "http://london.craigslist.co.uk/";

        $lCrawler = new Crawler(file_get_contents($lURL));
        $lBaseURLs = $lCrawler
            ->filter('li[class=" expand s"] a')
            ->each(function ($node, $i)
            {
                return $node->attr("href");
            });

        return $lBaseURLs;
    }

}