<?php

use Doctrine\Common\Annotations\AnnotationRegistry;
use Composer\Autoload\ClassLoader;

/**
 * @var ClassLoader $loader
 */
$loader = require __DIR__.'/../vendor/autoload.php';

AnnotationRegistry::registerLoader(array($loader, 'loadClass'));

//Ajouter pour activer le bundles
/*$loader->registerNamespaces(array(
    // ...
    'Gregwar' => __DIR__.'/../vendor/bundles',
));*/

return $loader;
