<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 20/11/14
 * Time: 19:02
 */

namespace Wegeoo\WebsiteBundle\Command;


use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\File\File;

class DatabaseCleanCommand extends ContainerAwareCommand
{
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function configure()
    {
        $this->setName("website:database:clean")
            ->setDescription("Clean all expired classifieds ( > 30 days )");
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        //get all expired classifieds.
        $lNum = $this->getContainer()->get('doctrine')->getManager()
            ->getRepository("WegeooDataLayerBundle:Classified")->deleteExpiredClassifieds();


        $output->writeln("Number of Classifieds deleted:$lNum");
        $output->writeln("Clean complete");
        $output->writeln(date('Y-m-d H:i:s', time() - 86400 * 30));


        //to remove duplicatas
        //DELETE FROM classified USING classified ua2
        //WHERE classified.reference = ua2.reference AND classified.id < ua2.id;
    }
}