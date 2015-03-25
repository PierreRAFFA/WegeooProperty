#!/bin/bash
cd /var/www
php app/console website:rss:rightmove:extract sale --env=prod