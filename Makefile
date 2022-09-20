#!make

docker_build_additional_image:
	docker-compose -f docker-compose-additional.yml --env-file .env.production up -d --build

docker_build_image:
	docker-compose --env-file .env.production up -d --build

docker_run_image:
	docker-compose --env-file .env.production up -d

docker_app: docker_build_image

run: docker_app

stop:
	docker-compose down