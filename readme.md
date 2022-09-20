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

Build and Run Image

```bash
make run
# or
docker-compose up -d --build
```

## Testing

```bash
node ace test
```

## Next Tasks

- ✅ Simple Auth
- ✅ Simple Booking Process
- ✅ Simple Article Feature
- ✅ Send Reminder 20 Minutes before Booking Time
- ⬜️ Unit Test
- ⬜️ Separation of message broker to another service
- ⬜️ User Permission Admin and Customer
