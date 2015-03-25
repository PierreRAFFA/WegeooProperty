<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 20/11/14
 * Time: 19:02
 */

namespace Wegeoo\WebsiteBundle\Command;


use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\File\File;

class TranslationCommand extends ContainerAwareCommand
{
    const DELIMITER = ",";
    const TEXT_SEPARATOR = "\"";

    protected $mOutput;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        $this->setName("website:translation:convert")
            ->setDescription("Convert csv file to xliff file. The csv file contains all locales.");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function execute(InputInterface $pInput, OutputInterface $pOutput)
    {
        $this->mOutput = $pOutput;
        $this->mOutput->writeln("Converting...");

        $lKernel = $this->getContainer()->get('kernel');

        $lTranslationsPath = $lKernel->locateResource('@WegeooWebsiteBundle/Resources/translations');


        $lFinder = new Finder();
        $lFinder->files()->in($lTranslationsPath);


        foreach($lFinder as $lFile)
        {
            $lFile = new File($lFile);
            $lExtension = strtolower($lFile->getExtension());

            if($lExtension == "csv")
            {
                $this->convertCSVToXLFs($lFile);
            }
        }
        $this->mOutput->writeln("Conversion complete");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////  CONVERT TO ARRAY
    protected function convertCSVToXLFs($pCSVFile)
    {
        $lCSVFilepath = $pCSVFile->getPathName();

        $lCSVLocales = $this->convertCSVToArray($lCSVFilepath);
        //$this->getContainer()->get("logger")->info("lCSVArray:".var_export(($lCSVLocales),true));

        foreach($lCSVLocales as $lLocale=>$lCSVLocale)
        {
            $lDestinationXlf = sprintf("%s/%s.%s.xlf" , dirname($lCSVFilepath), $pCSVFile->getBasename(".csv") , $lLocale);
            $this->writeXLF($lCSVLocale,$lDestinationXlf);
        }
    }

    protected function convertCSVToArray($pCSVFilepath)
    {
        $lCSV = array();

        $lContents = file_get_contents($pCSVFilepath);

        $lLines = explode("\n" , $lContents);

        $lLocales = array();
        foreach($lLines as $lLineIndex=>$lLine)
        {
            $lLineArray = $this->convertLineToArray($lLine);

            //get all locales with the first line
            if ( $lLineIndex == 0)
            {
                //remove first element which represents the key
                array_shift($lLineArray);

                $lLocales = $lLineArray;

                foreach($lLocales as $lIndex => $lLocale)
                {

                    //to remove double quotes
                    $lLocales[$lIndex] = $lLocale;
                    $this->mOutput->writeln("Locale detected: '$lLocale'");

                    $lCSV[$lLocale] = array();
                }
            }else{
                if ( count($lLineArray) == count($lLocales)+1)
                {
                    //the first element is the key
                    $lKey = $lLineArray[0];

                    //the others are string
                    foreach($lLocales as $lLocaleIndex=>$lLocale)
                    {
                        $lCSV[$lLocale][$lKey] = $lLineArray[$lLocaleIndex+1];
                    }
                }else{
                    if ( $lLine != '')
                        $this->mOutput->writeln("This line '$lLine' has been ignored");
                }
            }
        }
        return $lCSV;
    }
    protected function convertLineToArray($pLine)
    {
        $lExplodedStrings = str_getcsv($pLine,self::DELIMITER);

        return $lExplodedStrings;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////  WRITE XLF
    protected function writeXLF($pCSVLocale,$pDestinationXlf)
    {
        $lXliff = new \SimpleXMLElement('<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2"><file source-language="en" datatype="plaintext" original="file.ext"><body></body></file></xliff>');

        $lTransUnitId = 0;
        foreach($pCSVLocale as $pKey => $pValue)
        {
            $lTransUnitXML  = $lXliff->file->body->addChild("trans-unit");
            $lTransUnitXML["id"] = $lTransUnitId++;

            $lTransUnitXML->addChild("source" , $pKey);
            $lTransUnitXML->addChild("target" , $pValue);
        }

        //save the xlf
        $lXliff->asXML($pDestinationXlf);
        $this->mOutput->writeln("Write XLF: '$pDestinationXlf'");
    }
} 