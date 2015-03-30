<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 01/12/14
 * Time: 23:53
 */

namespace Wegeoo\WebsiteBundle\Command;


use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\Output;
use Symfony\Component\Console\Output\OutputInterface;

class SiteMapCommand extends ContainerAwareCommand
{
    const MAX_URLS_PER_SITEMAP = 40000;

    const SITEMAP_DIRECTORY = "/var/www/prod/web";

    /**
     * @var Output
     */
    protected $mOutput;
    protected $mNumSitemaps = 0;
    protected $mCurrentSitemap = array();
    protected $mServerName;
    protected $mNumURLs = 0;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////// CONFIGURE
    protected function configure()
    {
        $this->setName("website:sitemap:generate")
            ->setDescription("Generate the sitemap of Wegeoo")
            ->addArgument("serverName" , InputArgument::OPTIONAL, "Which website ? (ex: www.wegeoo.com)");

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////  EXECUTE
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->mOutput = $output;

        //get argument
        $this->mServerName = $input->getArgument('serverName');
        if ( !$this->mServerName)
            $this->mServerName = "www.wegeoo.com";

        //base URL
        $lBaseURL = $this->getContainer()->get('router')->generate('wegeoo_website_homepage', array() , false);

        //ADD homepage
        $lURL = array('loc' =>  "http://" . $this->mServerName . $lBaseURL ,  'priority' => '1');
        $this->addURLInfo($lURL);

        //ADD publication page
        $lParams = array();
        $lParams["wegeooType"] = "property";
        $lParams["post"] = "post";
        $lURL = array('loc' =>  "http://" . $this->mServerName . $this->getContainer()->get('router')->generate('wegeoo_website_publication', $lParams, false) ,  'priority' => '1');
        $this->addURLInfo($lURL);

        //ADD all cities
        $lCities = $this->getContainer()->get('doctrine')->getManager()
            ->getRepository("WegeooDataLayerBundle:City")->findAll();

//        $lCities = array($lCities[0]);
//        $this->mOutput->writeln(var_export($lCities,true));
//        die();

        foreach ($lCities as $lCity)
        {
            //ignore incorrect cities
            if ( strpos(strtolower($lCity->getUppercaseName()) , "geographic") !== FALSE ) continue;

            $lTypes = array("sale" , "rent");

            foreach($lTypes as $lType)
            {
                $lParams = array();
                $lParams["pWegeooType"]         = $this->getContainer()->get("translator")->trans("wegeoo.property" , array(), null, $this->getContainer()->getParameter('locale'));//@TODO locale
                $lParams["pCategoryLocaleName"] = $this->getContainer()->get("translator")->trans($lType , array(), null, $this->getContainer()->getParameter('locale'));//@TODO locale
                $lParams["pCityPostCode"]       = strtolower($lCity->getPostCode());
                $lParams["pCityName"]           = strtolower(str_replace(" " , "-" , $lCity->getUppercaseName()));

                $lURL = array('loc' => "http://" . $this->mServerName . $this->getContainer()->get('router')->generate('wegeoo_website_homepage', $lParams , false) ,
                    'changefreq' => "daily",
                    'priority' => '0.9');
                $this->addURLInfo($lURL);
            }
        }

        //ADD all classifieds
        $lClassifieds = $this->getContainer()->get('doctrine')->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->findAll();

        foreach ($lClassifieds as $lClassified)
        {
            if ( $lClassified->getReference())
            {
                $lURL = array('loc' => "http://" . $this->mServerName . $this->getContainer()->get("wegeoo")->getClassifiedURL($lClassified) ,  'priority' => '0.5');
                $this->addURLInfo($lURL);
            }
        }

        if ( count($this->mCurrentSitemap))
        {
            $this->writeSitemap();
        }

        $this->writeSitemapIndex();

        $this->mOutput->writeln("Sitemaps Complete: {$this->mNumURLs} URLs added");
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// ADD URL
    protected function addURLInfo($pURL)
    {
        $this->mNumURLs++;
        if ( count($this->mCurrentSitemap) >= self::MAX_URLS_PER_SITEMAP)
        {
            $this->writeSitemap();
            $this->mCurrentSitemap = array();
        }
        $this->mCurrentSitemap[] = $pURL;
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// WRITE SITEMAP INDEX
    protected function writeSitemapIndex()
    {
        //Generate the sitemapIndex
        $lRenderParams = array();
        $lRenderParams["numSitemaps"]   = $this->mNumSitemaps;
        $lRenderParams["serverName"]    = "http://" . $this->mServerName;
        $lResult =  $this->getContainer()->get('templating')->render('WegeooWebsiteBundle:Default:sitemapIndex.xml.twig', $lRenderParams);

        //export sitemap index
        $lSitemapIndexPath = sprintf("%s/sitemap.xml" , self::SITEMAP_DIRECTORY);
        $lSuccess = file_put_contents($lSitemapIndexPath , $lResult);
        if ( $lSuccess !== FALSE)
        {
            $this->mOutput->writeln("Sitemap 'sitemap.xml' Successfully Created");
        }else{
            $this->mOutput->writeln("ERROR: Sitemapindex 'sitemap.xml' not Created");
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// WRITE SITEMAPS
    protected function writeSitemap()
    {
        $this->mOutput->writeln(__METHOD__);

        //generate the other sitemaps
        $lRenderParams = array();
        $lRenderParams["urls"]          = $this->mCurrentSitemap;
        $lRenderParams["serverName"]    = "http://" . $this->mServerName;
        $lResult =  $this->getContainer()->get('templating')->render('WegeooWebsiteBundle:Default:sitemap.xml.twig', $lRenderParams);
        //$output->writeln($lResult);

        $lSitemapPath = sprintf("%s/sitemap%s.xml" , self::SITEMAP_DIRECTORY , $this->mNumSitemaps++);
        $lSuccess = file_put_contents($lSitemapPath , $lResult);
        if ( $lSuccess !== FALSE)
        {
            $this->mOutput->writeln(sprintf("Sitemap '%s' Successfully Created" , basename($lSitemapPath)));
        }else{
            $this->mOutput->writeln("ERROR: Sitemapindex '%s' not Created" , basename($lSitemapPath));
        }
    }
}