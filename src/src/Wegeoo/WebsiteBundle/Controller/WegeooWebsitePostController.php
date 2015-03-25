<?php

namespace Wegeoo\WebsiteBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Wegeoo\DataLayerBundle\Entity\Classified;

class WegeooWebsitePostController extends Controller
{
    public static $LOGGER;
   	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// ACTIONS
    public function renderAction($wegeooType)
    {
        self::$LOGGER = $this->get("logger");

        //get parameters
        $lRequest = $this->getRequest();
        $lParameters = $lRequest->request->all();
        $this->get("logger")->info(var_export($lParameters, true));

        //get context for the baseURL
        $lRequestContext = $this->get("router")->getContext();

        //change locale
        //$lRequest->setLocale($pLocale);

        //create a classified
        $lClassified = new Classified();

        //create the form
        $lForm = $this->createForm('classified_form', $lClassified );
        $this->get("logger")->info("3");
        $lForm->handleRequest($lRequest);

        //valid form
        if ( $lForm->isValid())
        {
            //set Reference
            $lReference = $this->generateReference(8,"wg-");
            $this->get("logger")->info("lReference:".$lReference);
            $lClassified->setReference($lReference);

            //set Activation Code
            $lActivationCode = $this->generateReference(16,"");
            $this->get("logger")->info("activationCode:".$lActivationCode);
            $lClassified->setActivationCode($lActivationCode);

            //manage Files
            $this->manageUploadedFiles($lRequest,$lClassified);

            //set Creation Date
            $lClassified->setCreationDate(new \DateTime());

            //set Modification Date
            $lClassified->setModificationDate(new \DateTime());

            //set client ip
            $lClassified->setClientIp($_SERVER["REMOTE_ADDR"]);

            $lDoctrineManager = $this->getDoctrine()->getManager();
            $lDoctrineManager ->persist($lClassified);
            $lDoctrineManager->flush();

            $lRequest->getSession()->getFlashBag()->add('notice', $this->get("translator")->trans("post.classified.posted"));

            $this->get("wegeoo")->sendActivationMail($lClassified);

            //Create params used in the twig
            $lRenderParams = array();
            $lRenderParams["title"] 				= "Wegeoo - " . $this->get("translator")->trans("post.classified.posted");
            $lRenderParams["baseURL"] 				= $lRequestContext->getBaseUrl(). "/";
            $lRenderParams["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();
            $lRenderParams["classifiedForm"] = $lForm->createView();


            //render the index page
            return $this->render('WegeooWebsiteBundle:Default:postValidated.html.twig', $lRenderParams);
            return $this->render('WegeooWebsiteBundle:Default:post.html.twig', $lRenderParams);

        }else{
            $this->get("logger")->info("not valid");
            $this->get("logger")->info( var_export($lForm->getErrors(),true));

            //Create params used in the twig
            $lRenderParams = array();
            $lRenderParams["title"] 				= "Wegeoo - Publier votre annonce";// à traduire
            $lRenderParams["baseURL"] 				= $lRequestContext->getBaseUrl() . "/";
            $lRenderParams["mostPopulatedTowns"] 	= $this->getMostPopulatedTowns();
            $lRenderParams["previewClassifiedAdTemplateURL"] = "";//@TODO create a config file
            $lRenderParams["classifiedForm"] = $lForm->createView();

            //render the index page
            return $this->render('WegeooWebsiteBundle:Default:post.html.twig', $lRenderParams);
        }
    }

    protected function manageUploadedFiles($pRequest,$pClassified)
    {
        foreach($pRequest->files as $lUploadedFiles)
        {
            $this->get("logger")->info("lUploadedFiles:".var_export($lUploadedFiles,true));

            //medias
            if ( isset($lUploadedFiles["medias"]))
            {
                $lUploadedMedias = $lUploadedFiles["medias"];

                $lMediaIndex = 0;
                foreach($lUploadedMedias as $lUploadedMedia)
                {
                    if ( $lUploadedMedia )
                    {
                        $lMediaName = sprintf("%s%s.%s" , $lMediaIndex++ , $this->generateReference(8) , $lUploadedMedia->getClientOriginalExtension());
                        $lUploadedMedia->move($pClassified->getMediasDirectory() , $lMediaName);
                    }

                }
            }

            //logo only available for professional
            if ( $pClassified->getContactType() == 1)
            {
                $this->get("logger")->info("1");
                if ( isset($lUploadedFiles["contact"]))
                {
                    $this->get("logger")->info("2");
                    if (isset($lUploadedFiles["contact"]["logo"]))
                    {
                        $this->get("logger")->info("3");
                        $lUploadedLogo = $lUploadedFiles["contact"]["logo"];

                        if ($lUploadedLogo)
                        {
                            $this->get("logger")->info("4");
                            $lLogoName = sprintf("logo.%s" , $lUploadedLogo->getClientOriginalExtension());
                            $lUploadedLogo->move($pClassified->getLogoDirectory() , $lLogoName);
                        }
                    }
                }
            }
        }
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////// GET MOST POPULATED TOWNS
    protected function getMostPopulatedTowns()
    {
        $lViewData = $this->getDoctrine()->getManager()
            ->getRepository("WegeooDataLayerBundle:City")->getCitiesFromPopulation(48);

        return $lViewData;
    }
	/////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////// GET USER CITY
	protected function generateReference($pLength, $pPrefix = "")
    {
        $lReference = $pPrefix . substr(sha1(rand()), 0, $pLength);

        //check if reference exists by checking classified storage path
        $lClassifiedStoragePath = sprintf("/var/www/storage/%s" , $lReference);
        if ( file_exists($lClassifiedStoragePath))
            $lReference = $this->generateReference($pLength, $pPrefix);

        return $lReference;
	}
}
