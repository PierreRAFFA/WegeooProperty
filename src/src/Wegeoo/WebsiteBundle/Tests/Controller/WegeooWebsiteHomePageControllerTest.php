<?php

namespace Wegeoo\WebsiteBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class WegeooWebsiteHomePageControllerTest extends WebTestCase
{
    public function testIndex()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/immobilier/location/34000-montpellier');

        //trigger_error("num:".var_export($crawler->html(),true));

        //HomePage display
        //$lPageName = (string) $crawler->filterXpath('//meta[@data-pagename]')->attr("data-pagename");
        //$this->assertTrue($lPageName === "home");

        //Test Filters Filling.


        //Test Link to Publication page


        //Test Search button


        //Test link to the first classified



    }
}