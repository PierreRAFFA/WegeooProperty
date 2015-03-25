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
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Wegeoo\DataLayerBundle\Entity\Classified;
use Wegeoo\DataLayerBundle\Entity\Utils\ClassifiedUtils;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsitePostController;

class ClassifiedMediasType extends AbstractType
{
    protected $mTranslator;

    public function __construct(Translator $pTranslator)
    {
        $this->mTranslator = $pTranslator;
    }

    public function buildForm(FormBuilderInterface $pBuilder, array $pOptions)
    {
        $pBuilder->add("media1" , "file" , array("label" => false));
        $pBuilder->add("media2" , "file" , array("label" => false));
        $pBuilder->add("media3" , "file" , array("label" => false));


        $pBuilder->addEventListener(FormEvents::SUBMIT , function(FormEvent $pEvent)
        {
            //get form
            $lForm = $pEvent->getForm();

            $lMedias = array("media1" , "media2", "media3");

            foreach($lMedias as $lMediaId)
            {
                if (is_null( $lForm->get($lMediaId)->getData()) == FALSE)
                {
                    $lMedia = $lForm->get($lMediaId)->getData();
                    WegeooWebsitePostController::$LOGGER->info("lMedia:".var_export($lMedia->getClientOriginalExtension(),true));

                    if ( in_array($lMedia->getClientOriginalExtension() , ClassifiedUtils::$MEDIA_ALLOWED_EXTENSIONS ) == FALSE)
                    {
                        $lForm[$lMediaId]->addError(new FormError($this->mTranslator->trans("classified.media.extension.error")));
                    }

                }
            }

        });
    }

    public function setDefaultOptions(OptionsResolverInterface $pResolver)
    {

    }

    public function getParent()
    {
        return 'form';
    }

    public function getName()
    {
        return 'classified_medias';
    }
}