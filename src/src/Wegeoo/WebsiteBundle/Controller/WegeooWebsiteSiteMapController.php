<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 01/12/14
 * Time: 20:36
 */

namespace Wegeoo\WebsiteBundle\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Wegeoo\DataLayerBundle\Entity\Classified;

class WegeooWebsiteSiteMapController extends Controller
{

    const MAX_URLS = 10;
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// MAIN SITEMAP
    public function renderAction()
    {
        $lSitemaps = array();

        $lURLs = array();

        $lClassifieds = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->findAll();
        return;

        foreach ($lClassifieds as $lClassified)
        {
            if ( $lClassified->getReference())
            {
                $lParams = array();
                $lParams["pWegeooType"]         = $this->get("translator")->trans("realestate" , array(), null, $lClassified->getCountryCode());
                $lParams["pCategoryLocaleName"] = $this->get("translator")->trans($lClassified->getType() , array(), null, $lClassified->getCountryCode());
                $lParams["pCityPostCode"]       = $lClassified->getCity()->getPostCode();
                $lParams["pCityName"]           = strtolower($lClassified->getCity()->getUppercaseName());
                $lParams["pReference"]          = $lClassified->getReference();

                $lURL = array('loc' => $this->generateUrl('wegeoo_website_classifiedpage', $lParams , true) ,  'priority' => '0.5');


                if ( count($lURLs) < self::MAX_URLS)
                {
                    $lURLs[] = $lURL;
                }else{
                    $lSitemaps[] = $lURLs;
                    $lURLs = array();
                }
            }
        }

        $lRenderParams = array();
        $lRenderParams["sitemaps"] = $lSitemaps;
        $lRenderParams["host"] = $this->getRequest()->getHost();
        return $this->render('WegeooWebsiteBundle:Default:sitemap.xml.twig', $lRenderParams);
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// WITH INDEX
    public function renderWithIndexAction($index)
    {
        $lURLs = array();

        if ( $index == 0)
        {
            //home page
            $lParams = array();
            $lParams["pWegeooType"]         = $this->get("translator")->trans("realestate" , array(), null, $lClassified->getCountryCode());
            $lParams["pCategoryLocaleName"] = $this->get("translator")->trans($lClassified->getType() , array(), null, $lClassified->getCountryCode());
            $lParams["pCityPostCode"]       = $lClassified->getCity()->getPostCode();
            $lParams["pCityName"]           = strtolower($lClassified->getCity()->getUppercaseName());

            $lURL = array('loc' => $this->generateUrl('wegeoo_website_classifiedpage', $lParams , true) ,  'priority' => '0.5' , 'changefreq' => 'daily');
            $lURLs[] = $lURL;

            //publication page
            $lURL = array('loc' => $this->generateUrl('wegeoo_website_classifiedpage', $lParams , true) ,  'priority' => '0.5' , 'changefreq' => 'daily');
            $lURLs[] = $lURL;

        }else{

            //search all classifieds
            $lClassifieds = $this->getDoctrine()->getManager()
                ->getRepository("WegeooDataLayerBundle:Classified")->findAll();

            $lMin = ($index-1) * self::MAX_URLS;
            $lMax = max($lMin + self::MAX_URLS , count($lClassifieds));

            for($iC = $lMin ; $iC < $lMax ; $iC++)
            {
                $lClassified = $lClassifieds[$iC];

                if ( $lClassified->getReference())
                {
                    $lParams = array();
                    $lParams["pWegeooType"]         = $this->get("translator")->trans("realestate" , array(), null, $lClassified->getCountryCode());
                    $lParams["pCategoryLocaleName"] = $this->get("translator")->trans($lClassified->getType() , array(), null, $lClassified->getCountryCode());
                    $lParams["pCityPostCode"]       = $lClassified->getCity()->getPostCode();
                    $lParams["pCityName"]           = strtolower($lClassified->getCity()->getUppercaseName());
                    $lParams["pReference"]          = $lClassified->getReference();

                    $lURL = array('loc' => $this->generateUrl('wegeoo_website_classifiedpage', $lParams , true) ,  'priority' => '0.5' , 'changefreq' => 'daily');
                    $lURLs[] = $lURL;
                }
            }
        }


        $lRenderParams = array();
        $lRenderParams["urls"] = $lURLs;
        $lRenderParams["host"] = $this->getRequest()->getHost();
        return $this->render('WegeooWebsiteBundle:Default:sitemapIndex.xml.twig', $lRenderParams);
    }
} 