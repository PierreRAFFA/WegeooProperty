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
use Symfony\Component\Console\Output\OutputInterface;

class TestCommand extends ContainerAwareCommand
{
    protected $mOutput;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////// CONFIGURE
    protected function configure()
    {
        $this->setName("website:test")
            ->setDescription("Test");

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////  EXECUTE
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->mOutput = $output;

        $lT1 = microtime(true);
        $lClassifieds = $this->getContainer()->get('doctrine')->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->findBy(array("category" => "rent"));
        $lT2 = microtime(true);

        foreach($lClassifieds as $lClassified)
        {
            $lDistance = $this->computeDistance($lClassified->getLatitude() , $lClassified->getLongitude(),51.50735000,-0.12776000);
            //$this->mOutput->writeln(round($lDistance)."m");
        }
        $lT3 = microtime(true);
        $this->mOutput->writeln(count($lClassifieds) . " classifieds found");
        $this->mOutput->writeln("Get all classifieds:". round(($lT2 - $lT1) * 1000) . "ms");
        $this->mOutput->writeln("Compute Distance for each:". round(($lT3 - $lT2) * 1000) . "ms");
        $this->mOutput->writeln("Total Time:". round(($lT3 - $lT1) * 1000) . "ms");
    }
    protected function computeDistance($lat1,$lng1,$lat2,$lng2)
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
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// ADD URL
    protected function addURLInfo($pURL)
    {
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
        $lRenderParams["numSitemaps"]      = $this->mNumSitemaps;
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