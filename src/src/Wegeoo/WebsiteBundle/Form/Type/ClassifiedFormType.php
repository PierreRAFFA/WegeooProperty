<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 11/11/14
 * Time: 20:47
 */

namespace Wegeoo\WebsiteBundle\Form\Type;


use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Translation\Translator;

class ClassifiedFormType extends AbstractType
{
    protected $mRequest;
    protected $mTranslator;

    public function __construct(Request $pRequest, ObjectManager $pEntityManager , Translator $pTranslator)
    {
        $this->mRequest = $pRequest;
        $this->mTranslator = $pTranslator;
    }

    public function buildForm(FormBuilderInterface $pBuilder, array $pOptions)
    {
        $lLocale = $this->mRequest->getLocale();

        $lTypeParams    = array("label"=>$this->mTranslator->trans("classified.category"));
        $lTitleParams   = array("label"=>$this->mTranslator->trans("classified.title") , "required"=>true);
        $lDescParams    = array("label"=>$this->mTranslator->trans("classified.description") ,'attr' => array('rows' => '10'));
        $lCountryParams = array("data"=>$lLocale);
        $lCityParams    = array("label"=>$this->mTranslator->trans("classified.city"));
        $lLatLngParams  = array('map_latitude' => 51.507351,
                                'map_longitude' => -0.127758 ,
                                'label' => false ,
                                'height' => '300px');
        $lDetailsParams = array("label"=>false);
        $lMediasParams  = array("label"=>$this->mTranslator->trans("classified.medias") , "mapped"=>false);
        $lContactTypeParams = array("label"=>$this->mTranslator->trans("classified.contact_type"));
        $lContactParams = array("label"=>false);

        $pBuilder
            ->add("category" , new ClassifiedCategoryType($this->mTranslator), $lTypeParams)
            ->add("title" , null , $lTitleParams)
            ->add("description", 'textarea' , $lDescParams)
            ->add("countryCode", 'hidden' , $lCountryParams)
            ->add("city", "city_list" , $lCityParams)
            ->add("latLng", 'wegeoo_map', $lLatLngParams)
            ->add("details" , "classified_details", $lDetailsParams)
            ->add("medias" , "classified_medias", $lMediasParams)
            ->add("contactType" , new ClassifiedContactTypeType($this->mTranslator), $lContactTypeParams)
            ->add("contact", "classified_contact", $lContactParams)
            ->add('captcha', 'captcha')
            ->add("send" , "submit");

        //'Contact' value depends on 'contactType' value.
        $pBuilder->addEventListener(FormEvents::SUBMIT , function(FormEvent $pEvent)
        {
            //get form
            $lForm = $pEvent->getForm();

            //manage error
            $this->manageErrors($lForm);

            //modify classified
            $this->modifyClassified($lForm);

            //update the event with the modified classified
            $lClassified = $lForm->getData();
            $pEvent->setData($lClassified);

        });
    }

    protected function manageErrors($pForm)
    {
        $lClassified = $pForm->getData();

        //type
        $lType = $lClassified->getCategory();
        if (empty( $lType) || $lType == "empty_value")
            { $pForm['category']->addError(new FormError($this->mTranslator->trans("classified.field.error"))); }

    }

    protected function modifyClassified($pForm)
    {
        $lClassified = $pForm->getData();

        //contactType management
        $lContact = $lClassified->getContact();
        unset($lContact["logo"]);// remove logo in all cases because logo path is not stored in bdd

        $lContactType     = $lClassified->getContactType();
        if ($lContactType == 0)
        {
            //remove all professional informations
            $lContact = $lClassified->getContact();
            unset($lContact["company"]);
            unset($lContact["fax"]);
            unset($lContact["website"]);
        }
        //update the classified
        $lClassified->setContact($lContact);


        //Type management
        $lType = $lClassified->getCategory();
        if ( $lType == "sale")
        {
            //remove all useless informations
            $lDetails = $lClassified->getDetails();
            unset($lDetails["fees"]);
            unset($lDetails["deposit"]);

            //update the classified
            $lClassified->setDetails($lDetails);

        }else if ( $lType == "rent")
        {
            //remove all useless informations
            $lDetails = $lClassified->getDetails();
            unset($lDetails["buildingYear"]);
            unset($lDetails["workRequired"]);
            unset($lDetails["notarialFees"]);

            //update the classified
            $lClassified->setDetails($lDetails);
        }
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array('data_class' => 'Wegeoo\DataLayerBundle\Entity\Classified'));
    }

    public function getParent()
    {
        return 'form';
    }

    public function getName()
    {
        return 'classified_form';
    }
}