<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 12/11/14
 * Time: 00:22
 */

namespace Wegeoo\WebsiteBundle\Form\Type;


use Symfony\Bundle\FrameworkBundle\Translation\Translator;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsitePostController;

class WegeooMapType extends AbstractType
{
    protected $mTranslator;

    public function __construct(Translator $pTranslator)
    {
        $this->mTranslator = $pTranslator;
    }

    public function buildForm(FormBuilderInterface $pBuilder, array $pOptions)
    {
        $lAddressParams = array('label'=>$this->mTranslator->trans("classified.address") , 'mapped' => false ,'attr' => array(
                'placeholder' => $this->mTranslator->trans("classified.map.address.placeholder"),
            ));

        $pBuilder->add("address", 'text' , $lAddressParams);
        $pBuilder->add("move_marker", 'button' , array("label"=>$this->mTranslator->trans("classified.map.address.submit")));

        $pBuilder->add("latitude" , 'hidden' , array('mapped' => true));
        $pBuilder->add("longitude", 'hidden' , array('mapped' => true));
    }

    public function buildView(FormView $pView, FormInterface $pForm, array $pOptions)
    {
        $pView->vars['height']          = $pOptions['height'];
        $pView->vars['map_latitude']    = $pOptions['map_latitude'];
        $pView->vars['map_longitude']   = $pOptions['map_longitude'];
    }
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Wegeoo\DataLayerBundle\Entity\Classified',
            'height'     => '100px',
            'map_latitude'  => 48.8738,
            'map_longitude' => 2.295,
            'inherit_data' => true
        ));
    }

    public function getParent()
    {
        return 'form';
    }
    public function getName()
    {
        return 'wegeoo_map';
    }
} 