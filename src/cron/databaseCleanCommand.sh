#!/bin/bash
cd /var/www/prod
php app/console website:database:clean --env=prod