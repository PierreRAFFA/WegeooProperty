#!/bin/bash
echo "Send to Wegeoo SoYouStart Prod"
echo "YCVxTTHCAg3P";

#move to the correct folder
cd src

#Remove all debug files
rm -rf 'web/css';
rm -rf 'web/js';

#Copy all resources
php app/console cache:clear;
php app/console cache:clear --env=prod --no-debug;
php app/console assets:install;
php app/console website:translation:convert;
php app/console assetic:dump --env=prod --no-debug;

#Sync Files
rsync -avz --delete-after --exclude '*.sh' --exclude '*.sql' --exclude 'cron/' --exclude 'app/cache/' --exclude 'app/logs/' * root@188.165.251.163:/var/www/prod

#Sync cron files
rsync -avz --delete-after cron/* root@188.165.251.163:/etc/cron.d/

#Clean Symfony cache
echo "Clear Symfony Cache"

ssh root@188.165.251.163 "cd /var/www/prod/app/cache/; rm -r *"

#Add files for debug
php app/console assets:install web --symlink
php app/console assetic:dump

#back to the start folder
cd ..