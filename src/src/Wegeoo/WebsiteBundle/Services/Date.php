<?php

namespace Wegeoo\WebsiteBundle\Services;

use Monolog\Logger;
use Symfony\Component\Translation\Translator;

class Date
{
	protected $mLogger;
	protected $mTranslator;
	
	public function __construct(Logger $pLogger , Translator $pTranslator)
	{
		$this->mLogger 		= $pLogger;
		$this->mTranslator 	= $pTranslator;
	}
	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////  LOCALE
	public function getLocalizedDate($inDate , $inLocale = 'fr_FR')
	{
		if ($inDate == "" || is_null($inDate)) return "";
		
		$this->mLogger->info("inDate:".$inDate);
		$this->mLogger->info("inLocale:".$inLocale);

        $parts = explode(" " , $inDate);

        $day = $parts[0];
        $splitDay = explode("-" , $day);
        $year 		= $splitDay[0];
        $month 		= $splitDay[1];
        $dayNumber 	= $splitDay[2];

        if ( count($parts) > 1)
        {
            $time = $parts[1];
            $splitTime = explode(":" , $time);
            $hour 		= $splitTime[0];
            $minutes 	= $splitTime[1];
            $seconds 	= $splitTime[2];
        }

        switch($inLocale)
        {
            case 'fr_FR':
            case 'fr':
			    return $dayNumber . " " . $this->mTranslator->trans("month.".$month) . " " . $year;
                break;

            //3rd May 2015
            case 'en_US':
            case 'en':
                if ( $dayNumber == 1)
                    $dayNumber = "1st";
                else if ( $dayNumber == 2)
                    $dayNumber = "2nd";
                else if ( $dayNumber == 3)
                    $dayNumber = "3rd";
                else
                    $dayNumber .= "th";

			    return $dayNumber . " " . $this->mTranslator->trans("month.".$month) . " " . $year;
                break;
		}
	}
	public function getDateInfos($inDate , $inLocale = 'fr_FR')
	{
		$array = array();
		
		switch($inLocale)
		{
			case 'fr_FR':
			$parts = explode(" " , $inDate);
			
			$day = $parts[0];
			$splitDay = explode("-" , $day);
			$year 		= $splitDay[0];
			$month 		= $splitDay[1];
			$dayNumber 	= $splitDay[2];
			
			if ( count($parts) > 1)
			{
				$time = $parts[1];
				$splitTime = explode(":" , $time);
				$hour 		= $splitTime[0];
				$minutes 	= $splitTime[1];
				$seconds 	= $splitTime[2];
			}
			require_once dirname(__FILE__)."/../locale/ResourceManager.class.php";
			$array["day"] 	= $dayNumber;
			$array["month"] = ResourceManager::getString("month".$month);
			$array["year"] 	= $year;
		}
		return $array;
	}
}
	