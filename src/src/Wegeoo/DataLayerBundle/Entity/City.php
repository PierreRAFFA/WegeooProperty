<?php

namespace Wegeoo\DataLayerBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * City
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Wegeoo\DataLayerBundle\Entity\CityRepository")
 */
class City
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="code", type="string", length=20)
     */
    private $code;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="uppercase_name", type="string", length=255)
     */
    private $uppercaseName;

    /**
     * @var string
     *
     * @ORM\Column(name="parent_code", type="string", length=8, nullable=true)
     */
    private $parentCode;

    /**
     * @var string
     *
     * @ORM\Column(name="division", type="string", length=255)
     */
    private $division;
    /**
     * @var string
     *
     * @ORM\Column(name="division2", type="string", length=255 , nullable=true)
     */
    private $division2;
    /**
     * @var string
     *
     * @ORM\Column(name="slug_name", type="string", length=255 , nullable=true)
     */
    private $slugName;

    /**
     * @var integer
     *
     * @ORM\Column(name="pop", type="integer", options={"default" = 0}))
     */
    private $pop = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="post_code", type="string", length=255)
     */
    private $postCode;

    /**
     * @var float
     *
     * @ORM\Column(name="longitude", type="decimal", precision=11, scale=8)
     */
    private $longitude;

    /**
     * @var float
     *
     * @ORM\Column(name="latitude", type="decimal", precision=11, scale=8)
     */
    private $latitude;

    /**
     * @var boolean
     *
     * @ORM\Column(name="google_localized", type="boolean", options={"default" = FALSE})
     */
    private $googleLocalized = FALSE;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set code
     *
     * @param string $code
     * @return City
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code
     *
     * @return string 
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set name
     *
     * @param string $name
     * @return City
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set uppercaseName
     *
     * @param string $uppercaseName
     * @return City
     */
    public function setUppercaseName($uppercaseName)
    {
        $this->uppercaseName = $uppercaseName;

        return $this;
    }

    /**
     * Get uppercaseName
     *
     * @return string 
     */
    public function getUppercaseName()
    {
        return $this->uppercaseName;
    }

    /**
     * Set parentCode
     *
     * @param string $parentCode
     * @return City
     */
    public function setParentCode($parentCode)
    {
        $this->parentCode = $parentCode;

        return $this;
    }

    /**
     * Get parentCode
     *
     * @return string 
     */
    public function getParentCode()
    {
        return $this->parentCode;
    }

    /**
     * Set division
     *
     * @param string $division
     * @return City
     */
    public function setDivision($division)
    {
        $this->division = $division;

        return $this;
    }

    /**
     * Get division
     *
     * @return string 
     */
    public function getDivision()
    {
        return $this->division;
    }

    /**
     * Set division2
     *
     * @param string $division2
     * @return City
     */
    public function setDivision2($division2)
    {
        $this->division2 = $division2;

        return $this;
    }

    /**
     * Get division2
     *
     * @return string
     */
    public function getDivision2()
    {
        return $this->division2;
    }

    /**
     * Set slugName
     *
     * @param string slugName
     * @return City
     */
    public function setSlugName($slugName)
    {
        $this->slugName = $slugName;

        return $this;
    }

    /**
     * Get slugName
     *
     * @return string
     */
    public function getSlugName()
    {
        return $this->slugName;
    }

    /**
     * Set pop
     *
     * @param integer $pop
     * @return City
     */
    public function setPop($pop)
    {
        $this->pop = $pop;

        return $this;
    }

    /**
     * Get pop
     *
     * @return integer 
     */
    public function getPop()
    {
        return $this->pop;
    }

    /**
     * Set postCode
     *
     * @param string $postCode
     * @return City
     */
    public function setPostCode($postCode)
    {
        $this->postCode = $postCode;

        return $this;
    }

    /**
     * Get postCode
     *
     * @return string 
     */
    public function getPostCode()
    {
        return $this->postCode;
    }

    /**
     * Set longitude
     *
     * @param string $longitude
     * @return City
     */
    public function setLongitude($longitude)
    {
        $this->longitude = $longitude;

        return $this;
    }

    /**
     * Get longitude
     *
     * @return string 
     */
    public function getLongitude()
    {
        return $this->longitude;
    }

    /**
     * Set latitude
     *
     * @param string $latitude
     * @return City
     */
    public function setLatitude($latitude)
    {
        $this->latitude = $latitude;

        return $this;
    }

    /**
     * Get latitude
     *
     * @return string 
     */
    public function getLatitude()
    {
        return $this->latitude;
    }

    /**
     * Set googleLocalized
     *
     * @param boolean $googleLocalized
     * @return City
     */
    public function setGoogleLocalized($googleLocalized)
    {
        $this->googleLocalized = $googleLocalized;

        return $this;
    }

    /**
     * Get googleLocalized
     *
     * @return boolean 
     */
    public function getGoogleLocalized()
    {
        return $this->googleLocalized;
    }


    public function __toString()
    {
        return (string) $this->getId();
    }
}
