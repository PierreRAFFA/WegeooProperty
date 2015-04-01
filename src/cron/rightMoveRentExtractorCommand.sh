#!/bin/bash
cd /var/www/prod
php app/console website:rss:rightmove:extract rent --env=prod