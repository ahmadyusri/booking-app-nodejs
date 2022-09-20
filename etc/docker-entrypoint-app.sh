#!/bin/bash

#
# Entrypoint for Images Application Booking App
#
# Author: Yusri yusriahmad2@gmail.com
#

printf "[RUN docker-entrypoint-app.sh] Start PM2 command\n\n"

# Run Migration
if [[ "${RUN_MIGRATION}" == "1" ]]; then
	printf '[RUN docker-entrypoint-app.sh] Run Migration\n'
	node ace migration:run
fi

pm2 start "node ace bull:listen" --name="service-queue-booking-app"
pm2-runtime start "node server.js" --name="service-api-booking-app"
