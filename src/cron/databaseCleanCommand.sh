#!/bin/bash
cd /var/www
php app/console website:database:clean --env=prod