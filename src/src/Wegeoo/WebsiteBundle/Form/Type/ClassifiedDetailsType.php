<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 11/11/14
 * Time: 20:47
 */

namespace Wegeoo\WebsiteBundle\Form\Type;


use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Translation\Translator;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsitePostController;

class ClassifiedDetailsType extends AbstractType
{
    protected $mTranslator;

    public function __construct(Translator $pTranslator)
    {
        $this->mTranslator = $pTranslator;
    }
    public function buildForm(FormBuilderInterface $pBuilder, array $pOptions)
    {
        //on pourrait ici envoyer en options les fields qu'on veut voir s'afficher dans ce Type.

        //build the array of year
        $lBuildingYear = array();
        $lDate = new \DateTime();
        $lYear = intval($lDate->format("Y"));
        for($iYear = 1900 ; $iYear <= $lYear; $iYear++)
        {
            $lBuildingYear[$iYear] = intval($iYear);
        }

        //the selected year is the current year minus 10
        $lSelectedYear = $lYear - 10;

        //property types
        $lPropertyTypes = array();
        for($iProp = 0 ; $iProp <= 11; $iProp++)
        {
            $lPropertyTypes[$iProp] = $this->mTranslator->trans("classified.details.property_type.$iProp");
        }

        $lPropParams            = array("label"=>$this->mTranslator->trans("classified.details.property_type"), "choices" => $lPropertyTypes);
        $lPriceParams           = array("label"=>$this->mTranslator->trans("classified.details.price") , "data" => 0,'attr' => array('min' => 0));
        $lFeesParams            = array("label"=>$this->mTranslator->trans("classified.details.fees"), "data" => 0,'attr' => array('min' => 0));
        $lNotarialFeesParams    = array("label"=>$this->mTranslator->trans("classified.details.notarial_fees"), "data" => 0,'attr' => array('min' => 0));
        $lDepositParams         = array("label"=>$this->mTranslator->trans("classified.details.deposit"), "data" => 0,'attr' => array('min' => 0));
        $lNumRoomsParams        = array("label"=>$this->mTranslator->trans("classified.details.num_rooms"), "data" => 1,'attr' => array('min' => 0));
        $lNumBedRoomsParams     = array("label"=>$this->mTranslator->trans("classified.details.num_bedrooms"), "data" => 1,'attr' => array('min' => 0));
        $lNumBathRoomsParams    = array("label"=>$this->mTranslator->trans("classified.details.num_bathrooms"), "data" => 0,'attr' => array('min' => 0));
        $lNumToiletsParams      = array("label"=>$this->mTranslator->trans("classified.details.num_toilets"), "data" => 1,'attr' => array('min' => 0));
        $lNumFloorsParams       = array("label"=>$this->mTranslator->trans("classified.details.num_floors"), "data" => 0,'attr' => array('min' => 0));
        $lLivingAreaParams      = array("label"=>$this->mTranslator->trans("classified.details.living_area"), "data" => 0,'attr' => array('min' => 0));
        $lLivingRoomAreaParams  = array("label"=>$this->mTranslator->trans("classified.details.living_room_area"), "data" => 0);
        $lHeatingParams         = array('choices' => array(
                                            '0' => $this->mTranslator->trans("classified.details.heating.0"),
                                            '1' => $this->mTranslator->trans("classified.details.heating.1"),
                                            '2' => $this->mTranslator->trans("classified.details.heating.2"),
                                        ), "label"=>$this->mTranslator->trans("classified.details.heating"));
        $lGasesEmissionParams   = array("label"=>$this->mTranslator->trans("classified.details.greenhouse_gases_emission"), "data" => 0,'attr' => array('min' => 0 , 'step'=>0.25));
        $lEnergyConsumptionParams = array("label"=>$this->mTranslator->trans("classified.details.energy_consumption"), "data" => 0,'attr' => array('min' => 0, 'step'=>0.25));
        $lBuildingYear          = array("choices" => $lBuildingYear , 'data' => $lSelectedYear);
        $lWorkRequired          = array("label"=>$this->mTranslator->trans("classified.details.work_required"));

        $pBuilder->add("propertyType", "choice" , $lPropParams);
        $pBuilder->add("price" , "number" , $lPriceParams);
        $pBuilder->add("fees" , "number" , $lFeesParams);
        $pBuilder->add("notarialFees" , "number" , $lNotarialFeesParams);
        $pBuilder->add("deposit" , "number" , $lDepositParams);
        $pBuilder->add("numRooms" , "integer" , $lNumRoomsParams);
        $pBuilder->add("livingArea", "integer" , $lLivingAreaParams);
        $pBuilder->add("livingRoomArea", "integer" , $lLivingRoomAreaParams);
        $pBuilder->add("heating" , "choice" , $lHeatingParams);
        $pBuilder->add("numFloors" , "integer" , $lNumFloorsParams);
        $pBuilder->add("numBedrooms", "integer" , $lNumBedRoomsParams);
        $pBuilder->add("numBathrooms", "integer" , $lNumBathRoomsParams);
        $pBuilder->add("numToilets", "integer" , $lNumToiletsParams);
        $pBuilder->add("greenhouseGasesEmission" , "integer", $lGasesEmissionParams);
        $pBuilder->add("energyConsumption" , "integer", $lEnergyConsumptionParams);
        $pBuilder->add("buildingYear" , "choice" , $lBuildingYear);
        $pBuilder->add("workRequired" , "checkbox", $lWorkRequired);
    }

    public function getParent()
    {
        return 'form';
    }

    public function getName()
    {
        return 'classified_details';
    }
} 