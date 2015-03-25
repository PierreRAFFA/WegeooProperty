<?php

namespace Wegeoo\VisualCaptchaBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('WegeooVisualCaptchaBundle:Default:index.html.twig', array('name' => $name));
    }
}
