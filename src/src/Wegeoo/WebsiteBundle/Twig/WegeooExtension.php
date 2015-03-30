<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 07/12/14
 * Time: 12:21
 */

namespace Wegeoo\WebsiteBundle\Twig;


use Symfony\Component\DomCrawler\Crawler;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsiteClassifiedController;

class WegeooExtension extends \Twig_Extension
{
    protected $mCountry;

    public function __construct($country)
    {
        $this->mCountry = $country;
    }
    public function getFunctions() {
        return array(
            'formatPrice' => new \Twig_Function_Method($this, 'formatPriceFunction'),
            //is_safe allow to return text as HTML
            'setDefaultDivStyle' => new \Twig_Function_Method($this, 'setDefaultDivStyleFunction', array('is_safe' => array('html'))),
            'repairHTML' => new \Twig_Function_Method($this, 'repairHTML')
        );
    }

    public function formatPriceFunction($price)
    {
        $lPrice = $price;
        $lFormatter = new \NumberFormatter($this->mCountry, \NumberFormatter::CURRENCY);
        $lSymbol = $lFormatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL);

        $lNF = new \NumberFormatter($this->mCountry, \NumberFormatter::DECIMAL);
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

    /**
     * Test
     * @param $value
     * @return mixed
     */
    public function setDefaultDivStyleFunction($value)
    {
        return preg_replace("/<div>/" , '<div style="position:relative; float:left;">' , $value);
    }
    public function getName()
    {
        return 'wegeoo_extension';
    }



    public function repairHTML($string)
    {
        $lCrawler = new Crawler($string);
        return $lCrawler->text();
    }
}