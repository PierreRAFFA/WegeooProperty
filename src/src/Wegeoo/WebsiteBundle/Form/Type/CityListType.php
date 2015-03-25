<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 12/11/14
 * Time: 00:22
 */

namespace Wegeoo\WebsiteBundle\Form\Type;


use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Wegeoo\WebsiteBundle\Form\DataTransformer\CityToIdTransformer;

class CityListType extends AbstractType
{
    /**
     * @var ObjectManager
     */
    private $mEntityManager;

    public function __construct(ObjectManager $pEntityManager)
    {
        $this->mEntityManager = $pEntityManager;
    }


    public function buildForm(FormBuilderInterface $pBuilder, array $pOptions)
    {
        // this assumes that the entity manager was passed in as an option
        //$pBuilder->add("codgeo");

        $transformer = new CityToIdTransformer($this->mEntityManager);
        $pBuilder->addModelTransformer($transformer);

    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        parent::setDefaultOptions($resolver);
        $resolver->setDefaults(array(
            'data_class'  => 'Wegeoo\DataLayerBundle\Entity\City',
            'constraints' => array()
        ));
    }

    public function getParent()
    {
        return 'text';
    }

    public function getName()
    {
        return 'city_list';
    }
}