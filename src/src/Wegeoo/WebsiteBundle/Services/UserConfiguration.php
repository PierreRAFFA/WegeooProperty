<?php

namespace Wegeoo\WebsiteBundle\Services;

use Monolog\Logger;

class UserConfiguration
{
	protected $mLogger;
	
	public function __construct(Logger $pLogger)
	{
		$this->mLogger = $pLogger;
	}
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////  LOCALE
	public function getLocaleFromAcceptedLanguage($pLanguage)
	{
		$lLocale = "en_US";
		switch($pLanguage)
		{
			case "fr_FR": $lLocale = "fr"; break;
			case "en_GB": $lLocale = "gb"; break;
		}
		return $lLocale;
	}
	///////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////// GET USER CITY
	public function getWebsiteConfigurationFromUser()
	{
		$lConfiguration = array();
		
		//detect user town
		@$lContents = file_get_contents('http://www.geoplugin.net/php.gp?ip='.$_SERVER['REMOTE_ADDR']);
		$this->mLogger->info("lContents:".var_export($lContents,TRUE));
		
		if ( $lContents !== FALSE)
		{
			$lUserLocalisation = unserialize($lContents);
		
			$this->mLogger->info("lUserLocalisation:".var_export($lUserLocalisation,true));
			
			if ( is_null($lUserLocalisation) == FALSE && is_array($lUserLocalisation) && isset($lUserLocalisation["geoplugin_city"]))
			{
				//country
				$lConfiguration["countryCode"] 	= $lUserLocalisation["geoplugin_countryCode"];
				
				//city
				$lConfiguration["cityName"] 	= $lUserLocalisation["geoplugin_city"];
				
				$lTownLatitude 	= $lUserLocalisation["geoplugin_latitude"];
				$lTownLongitude = $lUserLocalisation["geoplugin_longitude"];
				
				$lLatLongToPostalCodeService = sprintf("http://www.geoplugin.net/extras/postalcode.gp?lat=%s8&long=%s" , $lTownLatitude , $lTownLongitude );
				$lLatLongToPostalCodeServiceResults = unserialize(file_get_contents($lLatLongToPostalCodeService));
				if ( is_null($lLatLongToPostalCodeServiceResults) == FALSE && is_array($lLatLongToPostalCodeServiceResults) && isset($lLatLongToPostalCodeServiceResults["geoplugin_postCode"]))
				{
					$lConfiguration["cityPostCode"] = $lLatLongToPostalCodeServiceResults["geoplugin_postCode"];
				}else{
					$this->mLogger->warn("Can not get the user city postCode");
				}
			}else{
				$this->mLogger->warn("Can not get the user location");
			}
		}
		
		return $lConfiguration;
	}
}
	