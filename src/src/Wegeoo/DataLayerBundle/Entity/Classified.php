<?php

namespace Wegeoo\DataLayerBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Finder\Finder;
use Wegeoo\WebsiteBundle\Controller\WegeooWebsitePostController;
use Symfony\Component\Validator\Constraints;

/**
 * Classified
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="Wegeoo\DataLayerBundle\Entity\ClassifiedRepository")
 */
class Classified
{
    const EXPIRATION_DELAY = 30;
    const MEDIA_MAX_FILESIZE        = 2000000;
    const DIRECTORY         = "/var/www/storage/%s";
    const MEDIAS_DIRECTORY  = "/var/www/storage/%s/medias";
    const QRCODE_PATH       = "/var/www/storage/%s/qrcode.png";

    //Properties Map
    const TYPE          = "ty";
    const CITY_NAME     = "cn";
    const CITY_POSTCODE = "cp";
    const PROPERTY_TYPE = "pt";
    const NUM_ROOMS     = "nr";

    const TYPE_APARTMENT        = "apartment";
    const TYPE_HOUSE            = "house";
    const TYPE_LAND             = "land";
    const TYPE_COMMERCIAL_SPACE = "commercial-space";
    const TYPE_PARKING          = "parking";
    const TYPE_SHOP             = "shop";
    const TYPE_BUILDING         = "building";
    const TYPE_RESIDENTIAL_BUILDING = "residential-building";
    const TYPE_OFFICE           = "office";
    const TYPE_LOFT             = "loft";
    const TYPE_CASTLE           = "castle";
    const TYPE_OTHERS           = "others";

    const CONTACT_TYPE_INDIVIDUAL   = "0";
    const CONTACT_TYPE_PROFESSIONAL = "1";

    /**
     * @var array
     */
    public $medias = array();
    /**
     * The Classified URL
     * @var string
     */
    public $url;
    public $caption;

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="bigint")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="reference", type="string", length=30)
     */
    private $reference;

    /**
     * @var string
     *
     * @ORM\Column(name="category", type="string", length=20)
     */
    private $category;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="creation_date", type="datetime")
     */
    private $creationDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="modification_date", type="datetime", nullable=true)
     */
    private $modificationDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="banner_begin_date", type="datetime", nullable=true)
     */
    private $bannerBeginDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="banner_end_date", type="datetime", nullable=true)
     */
    private $bannerEndDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="top_list_begin_date", type="datetime", nullable=true)
     */
    private $topListBeginDate;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="top_list_end_date", type="datetime", nullable=true)
     */
    private $topListEndDate;
	
	/**
     * @var string
     *
     * @Constraints\NotBlank()
     * @ORM\Column(name="title", type="string", length=150 , nullable=false)
     */
    private $title;
	
    /**
     * @var string
     *
     * @Constraints\NotBlank()
     * @ORM\Column(name="description", type="text", length=500, nullable=false)
     */
    private $description;
    /**
     * @var string
     *
     * @ORM\Column(name="details", type="json_array" , nullable=true)
     */
    private $details;

    /**
     * @var string
     *
     * @ORM\Column(name="contact", type="json_array" , nullable=true)
     */
    private $contact = NULL;

    /**
     * @var string
     *
     * @ORM\Column(name="options", type="json_array", nullable=true)
     */
    private $options;

    /**
     * @var string
     *
     * @ORM\Column(name="country_code", type="string", length=10)
     */
    private $countryCode;

    /**
     * @ORM\ManyToOne(targetEntity="Wegeoo\DataLayerBundle\Entity\City")
     * @ORM\JoinColumn(nullable=false , name="city_id", referencedColumnName="id")
     */
    private $city;

    /**
     * @var float
     *
     * @ORM\Column(name="latitude", type="decimal", precision=11, scale=8)
     */
    private $latitude;

    /**
     * @var float
     *
     * @ORM\Column(name="longitude", type="decimal", precision=11, scale=8)
     */
    private $longitude;

    /**
     * @var boolean
     *
     * @ORM\Column(name="geolocalized", type="boolean")
     */
    private $geolocalized;

    /**
     * @var integer
     *
     * @ORM\Column(name="num_seen", type="integer", options={"default" = 0})
     */
    private $numSeen = 0;

    /**
     * @var integer
     *
     * @ORM\Column(name="num_warnings", type="integer", options={"default" = 0})
     */
    private $numWarnings = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="activation_code", type="string", length=20 , nullable=true)
     */
    private $activationCode;

    /**
     * @var string
     *
     * @ORM\Column(name="lost_password_code", type="string", length=20, nullable=true)
     */
    private $lostPasswordCode;

    /**
     * @var string
     *
     * @ORM\Column(name="password", type="string", length=40, nullable=true)
     */
    private $password;

    /**
     * @var boolean
     *
     * @ORM\Column(name="active", type="boolean", options={"default" = FALSE})
     */
    private $active = FALSE;

    /**
     * @var integer
     *
     * @ORM\Column(name="contact_type", type="integer", nullable=true)
     */
    private $contactType = NULL;

    /**
     * @var boolean
     *
     * @ORM\Column(name="is_external", type="boolean", options={"default" = FALSE})
     */
    private $isExternal = FALSE;

    /**
     * @var string
     *
     * @ORM\Column(name="external_link", type="string", length=255, nullable=true)
     */
    private $externalLink;

    /**
     * @var int
     *
     * @ORM\Column(name="num_mails_received", type="integer", options={"default" = 0})
     */
    private $numMailsReceived = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="client_ip", type="string", length=19, nullable=false)
     */
    private $clientIp;

    /**
     * @var string
     *
     * @ORM\Column(name="external_medias", type="json_array", nullable=true)
     */
    private $externalMedias;

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
     * Set reference
     *
     * @param string $reference
     * @return Classified
     */
    public function setReference($reference)
    {
        $this->reference = $reference;

        $this->medias = $this->getMedias();

        return $this;
    }

    /**
     * Get reference
     *
     * @return string 
     */
    public function getReference()
    {
        return $this->reference;
    }

    /**
     * Set category
     *
     * @param string $category
     * @return Classified
     */
    public function setCategory($category)
    {
        $this->category = $category;

        return $this;
    }

    /**
     * Get category
     *
     * @return string
     */
    public function getCategory()
    {
        return $this->category;
    }
    
    /**
     * Set creationDate
     *
     * @param \DateTime $creationDate
     * @return Classified
     */
    public function setCreationDate($creationDate)
    {
        $this->creationDate = $creationDate;

        return $this;
    }

    /**
     * Get creationDate
     *
     * @return \DateTime 
     */
    public function getCreationDate()
    {
        return $this->creationDate;
    }

    /**
     * Set modificationDate
     *
     * @param \DateTime $modificationDate
     * @return Classified
     */
    public function setModificationDate($modificationDate)
    {
        $this->modificationDate = $modificationDate;

        return $this;
    }

    /**
     * Get modificationDate
     *
     * @return \DateTime 
     */
    public function getModificationDate()
    {
        return $this->modificationDate;
    }

    /**
     * Set bannerBeginDate
     *
     * @param \DateTime $bannerBeginDate
     * @return Classified
     */
    public function setBannerBeginDate($bannerBeginDate)
    {
        $this->bannerBeginDate = $bannerBeginDate;

        return $this;
    }

    /**
     * Get bannerBeginDate
     *
     * @return \DateTime 
     */
    public function getBannerBeginDate()
    {
        return $this->bannerBeginDate;
    }

    /**
     * Set bannerEndDate
     *
     * @param \DateTime $bannerEndDate
     * @return Classified
     */
    public function setBannerEndDate($bannerEndDate)
    {
        $this->bannerEndDate = $bannerEndDate;

        return $this;
    }

    /**
     * Get bannerEndDate
     *
     * @return \DateTime 
     */
    public function getBannerEndDate()
    {
        return $this->bannerEndDate;
    }

    /**
     * Set topListBeginDate
     *
     * @param \DateTime $topListBeginDate
     * @return Classified
     */
    public function setTopBeginDate($topListBeginDate)
    {
        $this->topListBeginDate = $topListBeginDate;

        return $this;
    }

    /**
     * Get topListBeginDate
     *
     * @return \DateTime 
     */
    public function getTopListBeginDate()
    {
        return $this->topListBeginDate;
    }

    /**
     * Set topListEndDate
     *
     * @param \DateTime $topListEndDate
     * @return Classified
     */
    public function setTopListEndDate($topListEndDate)
    {
        $this->topListEndDate = $topListEndDate;

        return $this;
    }

    /**
     * Get topListEndDate
     *
     * @return \DateTime 
     */
    public function getTopListEndDate()
    {
        return $this->topListEndDate;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return Classified
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set description
     *
     * @param string $description
     * @return Classified
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set details
     *
     * @param string $details
     * @return Classified
     */
    public function setDetails($details)
    {
        $this->details = $details;

        return $this;
    }

    /**
     * Get details
     *
     * @return string 
     */
    public function getDetails()
    {
        return $this->details;
    }

    /**
     * Set contact
     *
     * @param string $contact
     * @return Classified
     */
    public function setContact($contact)
    {
        $this->contact = $contact;

        return $this;
    }

    /**
     * Get contact
     *
     * @return string 
     */
    public function getContact()
    {
        return $this->contact;
    }

    /**
     * Set options
     *
     * @param string $options
     * @return Classified
     */
    public function setOptions($options)
    {
        $this->options = $options;

        return $this;
    }

    /**
     * Get options
     *
     * @return string
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Set countryCode
     *
     * @param string $countryCode
     * @return Classified
     */
    public function setCountryCode($countryCode)
    {
        $this->countryCode = $countryCode;

        return $this;
    }

    /**
     * Get countryCode
     *
     * @return string
     */
    public function getCountryCode()
    {
        return $this->countryCode;
    }

    /**
     * Set city
     *
     * @param City $city
     * @return Classified
     */
    public function setCity(City $city)
    {
        $this->city = $city;

        return $this;
    }

    /**
     * Get city
     *
     * @return City
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * Set latitude
     *
     * @param string $latitude
     * @return Classified
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
     * Set longitude
     *
     * @param string $longitude
     * @return Classified
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
     * This method is used because latitude and longitude are on a sub form
     *
     * @param $latlng
     * @return $this
     */
    public function setLatLng($latlng)
    {
        $this->setLatitude($latlng['latitude']);
        $this->setLongitude($latlng['longitude']);
        return $this;
    }

    public function getLatLng()
    {
        return array('latitude'=>$this->getLatitude(),'longitude'=>$this->getLongitude());
    }



    /**
     * Set geolocalized
     *
     * @param boolean $geolocalized
     * @return Classified
     */
    public function setGeolocalized($geolocalized)
    {
        $this->geolocalized = $geolocalized;

        return $this;
    }

    /**
     * Get geolocalized
     *
     * @return boolean 
     */
    public function getGeolocalized()
    {
        return $this->geolocalized;
    }

    /**
     * Set numSeen
     *
     * @param integer $numSeen
     * @return Classified
     */
    public function setNumSeen($numSeen)
    {
        $this->numSeen = $numSeen;

        return $this;
    }

    /**
     * Get numSeen
     *
     * @return integer 
     */
    public function getNumSeen()
    {
        return $this->numSeen;
    }

    /**
     * Set numWarnings
     *
     * @param integer $numWarnings
     * @return Classified
     */
    public function setNumWarnings($numWarnings)
    {
        $this->numWarnings = $numWarnings;

        return $this;
    }

    /**
     * Get numWarnings
     *
     * @return integer 
     */
    public function getNumWarnings()
    {
        return $this->numWarnings;
    }

    /**
     * Set activationCode
     *
     * @param string $activationCode
     * @return Classified
     */
    public function setActivationCode($activationCode)
    {
        $this->activationCode = $activationCode;

        return $this;
    }

    /**
     * Get activationCode
     *
     * @return string 
     */
    public function getActivationCode()
    {
        return $this->activationCode;
    }

    /**
     * Set lostPasswordCode
     *
     * @param string $lostPasswordCode
     * @return Classified
     */
    public function setLostPasswordCode($lostPasswordCode)
    {
        $this->lostPasswordCode = $lostPasswordCode;

        return $this;
    }

    /**
     * Get lostPasswordCode
     *
     * @return string 
     */
    public function getLostPasswordCode()
    {
        return $this->lostPasswordCode;
    }

    /**
     * Set password
     *
     * @param string $password
     * @return Classified
     */
    public function setPassword($password)
    {
        $this->password = $password;

        return $this;
    }

    /**
     * Get password
     *
     * @return string 
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * Set active
     *
     * @param boolean $active
     * @return Classified
     */
    public function setActive($active)
    {
        $this->active = $active;

        return $this;
    }

    /**
     * Get active
     *
     * @return boolean 
     */
    public function getActive()
    {
        return $this->active;
    }

    /**
     * Set contactType
     *
     * @param integer $contactType
     * @return Classified
     */
    public function setContactType($contactType)
    {
        $this->contactType = $contactType;

        return $this;
    }

    /**
     * Get contactType
     *
     * @return integer
     */
    public function getContactType()
    {
        return $this->contactType;
    }

    /**
     * Set isExternal
     *
     * @param boolean $isExternal
     * @return Classified
     */
    public function setIsExternal($isExternal)
    {
        $this->isExternal = $isExternal;

        return $this;
    }

    /**
     * Get isExternal
     *
     * @return boolean 
     */
    public function getIsExternal()
    {
        return $this->isExternal;
    }

    /**
     * Set externalLink
     *
     * @param string $externalLink
     * @return Classified
     */
    public function setExternalLink($externalLink)
    {
        $this->externalLink = $externalLink;

        return $this;
    }

    /**
     * Get externalLink
     *
     * @return string 
     */
    public function getExternalLink()
    {
        return $this->externalLink;
    }

    /**
     * Set clientIp
     *
     * @param string $clientIp
     * @return Classified
     */
    public function setClientIp($clientIp)
    {
        $this->clientIp = $clientIp;

        return $this;
    }

    /**
     * Get clientIp
     *
     * @return string
     */
    public function getClientIp()
    {
        return $this->clientIp;
    }
    /**
     * Set externalMedias
     *
     * @param string $medias
     * @return Classified
     */
    public function setExternalMedias($medias)
    {
        $this->externalMedias = $medias;

        $this->medias = $this->getMedias();

        return $this;
    }

    /**
     * Get externalMedias
     *
     * @return string
     */
    public function getExternalMedias()
    {
        return $this->externalMedias;
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////// NUM MAILS
    /**
     * Set numMailsReceived
     *
     * @param int $numMailsReceived
     * @return Classified
     */
    public function setNumMailsReceived($numMailsReceived)
    {
        $this->numMailsReceived = $numMailsReceived;

        return $this;
    }

    public function incrementNumMailsReceived()
    {
        $this->numMailsReceived++;
    }
    /**
     * Get numMailsReceived
     *
     * @return int
     */
    public function getNumMailsReceived()
    {
        return $this->numMailsReceived;
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////// NUM MAILS
    public function setURL($url)
    {
        $this->url = $url;
    }
    public function getURL()
    {
        if (is_null($this->url))
            throw new \Exception("Use 'wegeoo' Service with 'generateClassifiedURL' method before");
        return $this->url;
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////// SET CAPTION
    public function setCaption($caption)
    {
        $this->caption = $caption;
    }
    public function getCaption()
    {
        return $this->caption;
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////  MEDIAS
    public function findMedias()
    {
        $this->medias = $this->getMedias();
    }
    public function getMediasDirectory()
    {
        if ( $this->reference)
            return sprintf(self::MEDIAS_DIRECTORY , $this->reference );
        return NULL;
    }

    /**
     * @return array
     */
    public function getMedias()
    {
        $lMedias = array();

        $lDirectory = $this->getMediasDirectory();
        if ( $lDirectory && file_exists($lDirectory))
        {
            $lFinder = new Finder();
            $lFinder->files()
                ->in($lDirectory);

            foreach($lFinder as $lFile)
            {
                $lMedia = $lFile->getPathName();
                $lMedia = str_replace("/var/www" , "" , $lMedia);

                $lMedias[] = $lMedia;
            }
        }else{
            $lMedias = $this->externalMedias;
        }
        return $lMedias;
    }

    public function findURL()
    {
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////  QRCODE
    public function getQRCode()
    {
        if ( $this->reference)
            return sprintf(self::QRCODE_PATH , $this->reference );
        return NULL;
    }
    ////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////  LOGO
    /**
     * To move to the Advertiser table ( when exists )
     */
    public function getLogoDirectory()
    {
        if ( $this->reference)
            return sprintf(self::DIRECTORY, $this->reference );
        return NULL;
    }
    public function getLogo()
    {
        $lLogo = NULL;
        if ( $this->reference)
        {
            $lDirectory = $this->getMediasDirectory();
            if ( $lDirectory && file_exists($lDirectory)) {

                $lFinder = new Finder();
                $lFinder->files()
                    ->name("logo.*")
                    ->in($lDirectory);

                foreach ($lFinder as $lFile) ;

                if ($lFinder->count() == 1) {
                    $lLogo = $lFile->getPathName();
                    $lLogo = str_replace("/var/www", "", $lLogo);
                }
            }
        }
        return $lLogo;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// GET USER CITY
    public static function generateReference($pLength, $pPrefix = "")
    {
        $lReference = $pPrefix . substr(sha1(rand()), 0, $pLength);

        //check if reference exists by checking classified storage path
        $lClassifiedStoragePath = sprintf("/var/www/storage/%s" , $lReference);
        if ( file_exists($lClassifiedStoragePath))
            $lReference = self::generateReference($pLength, $pPrefix);

        return $lReference;
    }

}
