<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 11/11/14
 * Time: 20:47
 */

namespace Wegeoo\WebsiteBundle\Form\Type;


use Symfony\Bundle\FrameworkBundle\Translation\Translator;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Wegeoo\DataLayerBundle\Entity\Utils\ClassifiedUtils;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsitePostController;

class ClassifiedContactType extends AbstractType
{
    protected $mTranslator;

    public function __construct(Translator $pTranslator)
    {
        $this->mTranslator = $pTranslator;
    }

    public function buildForm(FormBuilderInterface $pBuilder, array $pOptions)
    {
        $pBuilder->add("logo" , "file");
        $pBuilder->add("company", null , array("label"=>$this->mTranslator->trans("classified.contact.company")));
        $pBuilder->add("name", null , array("label"=>$this->mTranslator->trans("classified.contact.name")));
        $pBuilder->add("email" , "email" , array("label"=>$this->mTranslator->trans("classified.contact.email")));
        $pBuilder->add("phone", null , array("label"=>$this->mTranslator->trans("classified.contact.phone")));
        $pBuilder->add("fax", null , array("label"=>$this->mTranslator->trans("classified.contact.fax")));
        $pBuilder->add("exposePhone" , "checkbox" , array("label"=>$this->mTranslator->trans("classified.contact.expose_phone")));
        $pBuilder->add("website" , null , array("label"=>$this->mTranslator->trans("classified.contact.website")));
        $pBuilder->add("legalInformation" , "textarea" , array("label"=>$this->mTranslator->trans("classified.contact.legal_information"),'attr' => array('rows' => '10')));
        //$pBuilder->add("captcha" , "captcha");

        $pBuilder->addEventListener(FormEvents::POST_SUBMIT , function(FormEvent $pEvent)
        {
            $lForm = $pEvent->getForm();

            $lViewData = $pEvent->getForm()->getRoot()->getViewData();

            $lNameData = $lForm->get('name')->getData();
            if (empty($lNameData))
                { $lForm['name']->addError(new FormError($this->mTranslator->trans("classified.field.error"))); }

            $lEmailData = $lForm->get('email')->getData();
            if (empty( $lEmailData))
                { $lForm['email']->addError(new FormError($this->mTranslator->trans("classified.field.error"))); }

            if (is_null( $lForm->get("logo")->getData()) == FALSE)
            {
                $lMedia = $lForm->get("logo")->getData();
                WegeooWebsitePostController::$LOGGER->info("lMedia:".var_export($lMedia->getClientOriginalExtension(),true));

                if ( in_array($lMedia->getClientOriginalExtension() , ClassifiedUtils::$MEDIA_ALLOWED_EXTENSIONS ) == FALSE)
                {
                    $lForm["logo"]->addError(new FormError($this->mTranslator->trans("classified.media.extension.error")));
                }

            }

            /**
             * @TODO valider le company et logo quand il sera possible de récupérer un Classified rempli à ce moment.
             */
//            if ( $lForm->get('contactType')->getData() == 1)
//            {
//                WegeooWebsitePostController::$LOGGER->info("ttotototott");
//                if (empty($lForm->get('company')->getData()))
//                    { $lForm['company']->addError(new FormError($this->mTranslator->trans("classified.field.error"))); }
//            }
        });
    }

    public function getParent()
    {
        return 'form';
    }

    public function getName()
    {
        return 'classified_contact';
    }
} 