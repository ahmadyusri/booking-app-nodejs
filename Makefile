#!make

docker_build_image:
	docker-compose up -d --build

docker_run_image:
	docker-compose up -d

docker_app: docker_build_image

run: docker_app

stop:
	docker-compose down