#!/bin/bash
echo "Send to Wegeoo"
echo "aG3q6YSg";

#Remove all debug files
rm -rf 'web/css';
rm -rf 'web/js';

#Copy all resources
php app/console cache:clear && php app/console cache:clear --env=prod --no-debug && php app/console assets:install && php app/console assetic:dump --env=prod --no-debug;

#Sync Files
rsync -avz --delete-after --exclude 'sendToWegeoo.sh' --exclude 'cron/' --exclude 'app/cache/' --exclude 'app/logs/' * root@94.23.24.104:/var/www/

#Sync cron files
rsync -avz --delete-after cron/* root@94.23.24.104:/etc/cron.d/

#Add files for debug
php app/console assets:install web --symlink
php app/console assetic:dump