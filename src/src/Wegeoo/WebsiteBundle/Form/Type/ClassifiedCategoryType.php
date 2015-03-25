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
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ClassifiedCategoryType extends AbstractType
{
    protected $mTranslator;

    public function __construct(Translator $pTranslator)
    {
        $this->mTranslator = $pTranslator;
    }

    public function setDefaultOptions(OptionsResolverInterface $pResolver)
    {
        $pResolver->setDefaults(array(
            'choices' => array(
                'empty_value' => $this->mTranslator->trans('classified.category.empty_value'),
                'sale' => $this->mTranslator->trans("classified.category.sale"),
                'rent' => $this->mTranslator->trans("classified.category.rent"),
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