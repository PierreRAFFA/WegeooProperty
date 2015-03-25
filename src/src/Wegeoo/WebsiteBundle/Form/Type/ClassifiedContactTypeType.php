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
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ClassifiedContactTypeType extends AbstractType{

    protected $mTranslator;

    public function __construct(Translator $pTranslator)
    {
        $this->mTranslator = $pTranslator;
    }

    public function setDefaultOptions(OptionsResolverInterface $pResolver)
    {
        $pResolver->setDefaults(array(
            'choices' => array(
                '0' => $this->mTranslator->trans("classified.contact_type.0"),
                '1' => $this->mTranslator->trans("classified.contact_type.1")
            )
        ));
    }

    public function getParent()
    {
        return 'choice';
    }

    public function getName()
    {
        return 'classified_category';
    }
} 