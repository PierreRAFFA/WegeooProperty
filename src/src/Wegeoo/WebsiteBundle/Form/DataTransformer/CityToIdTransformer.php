<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 13/11/14
 * Time: 21:03
 */

namespace Wegeoo\WebsiteBundle\Form\DataTransformer;


use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;
use Wegeoo\DataLayerBundle\Entity\City;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsitePostController;

class CityToIdTransformer implements DataTransformerInterface
{
    protected $mObjectManager;

    /**
     * @param ObjectManager $om
     */
    public function __construct(ObjectManager $om)
    {
        $this->mObjectManager = $om;
    }

    /**
     * Transforms an object (issue) to an id
     *
     * @param mixed $pCity
     * @return string the city codgeo
     */
    public function transform($pCity)
    {
        WegeooWebsitePostController::$LOGGER->info(__METHOD__);
        WegeooWebsitePostController::$LOGGER->info("pCity:".var_export($pCity,true));
        if (null === $pCity) {
            return "";
        }

        return $pCity->getId();
    }

    /**
     * Transforms a city to its id.
     *
     * @param mixed $pId
     * @return City The matching City
     */
    public function reverseTransform($pId)
    {
        WegeooWebsitePostController::$LOGGER->info(__METHOD__);
        WegeooWebsitePostController::$LOGGER->info("pId:".$pId);
        if (null === $pId) {
            return "";
        }

        $lCities = $this->mObjectManager->getRepository("WegeooDataLayerBundle:City")->findById($pId);
        WegeooWebsitePostController::$LOGGER->info(count($lCities). " city found");
        if ( count($lCities) == 1)
        {
            return $lCities[0];
        }else if ( count($lCities) > 1)
        {
            throw new TransformationFailedException(sprintf("Several cities have been found with id '%s'!", $pId));
        }else{
            throw new TransformationFailedException(sprintf("No city has been found with id '%s'!", $pId));
        }
    }
}