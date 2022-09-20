# Getting Started

Booking APP using NodeJS with Framework AdonisJS

## Manual Deployment

Install Package

```bash
yarn install
# or
npm install
```

Copy Environment

```bash
cp .env.example .env
```

Run Development

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3333](http://localhost:3333) to view it in the browser.

Run Production

```bash
## Build
yarn build
# or
npm run build

## Enter build folder
cd build/

## Install Package
yarn install
# or
npm install

## Start
yarn start
# or
npm run start
```

Open [http://localhost:3333](http://localhost:3333) to view it in the browser.

Running Migration

```bash
node ace migration:run
```

Start Queue

```bash
node ace bull:listen
```

## Docker Deployment

Optional Build and Run Additional Image Redis and Mysql

```bash
make docker_build_additional_image
# or
docker-compose -f docker-compose-additional.yml --env-file .env.production up -d
```

Prepare environment test and production

```bash
# Copy default env
cp .env.example .env.production

# Update .env.production
nano .env.production

# Update .env.test
nano .env.test

# Update redis, mysql config to success running test
```

Build and Run Image

```bash
make run
# or
docker-compose --env-file .env.production up -d
```

Update docker-compose.yml if redis and mysql host to container when running test

```bash
# Add services.app.build to
network: booking_app_network

# If error `Error response from daemon: network mode "booking_app_network" not supported by buildkit`
# set DOCKER_BUILDKIT to false

DOCKER_BUILDKIT=0 make run
# or
DOCKER_BUILDKIT=0 docker-compose --env-file .env.production up -d
```

## Testing

```bash
node ace test
```

## Live Demo

- Open [Live Demo](https://booking-app.yukkoding.com) to view it in the browser.
- Postman Collection [Restful API](https://www.postman.com/collections/daba950679063b2f9e2e) click to view it in the browser.

## Next Tasks

- ✅ Simple Auth
- ✅ Simple Booking Process
- ✅ Simple Article Feature
- ✅ Send Reminder 20 Minutes before Booking Time when Booking Time After 30 Minutes from Now
- ✅ Delete Reminder on Booking delete/cancel
- ⬜️ Unit Test
- ⬜️ Separation of message broker to another service
- ⬜️ User Permission Admin and Customer
