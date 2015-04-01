#!/bin/bash
cd /var/www/prod
php app/console website:sitemap:generate --env=prod