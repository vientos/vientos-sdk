# vientos-sdk
Development environment for vientos stack, it includes as submodules:

* https://github.com/ehecame/vientos-nahual
* https://github.com/ehecame/vientos-hapipalapi

## dependencies

* npm *(see: https://github.com/creationix/nvm)*
* docker *(see: https://www.docker.com/products/overview#/install_the_platform)*
* docker-compose *(see: https://www.docker.com/products/docker-compose)*

## usage

```shell
npm install
```
will install npm dependencies

```shell
docker-compose up -d
```
will start container with MongoDB in detached mode

```shell
git submodule init && git submodule update
```
will checkout service and PWA

```shell
cp env.examp env
# edit env if needed
source ./env
```

### vientos-service
```shell
cd vientos-service
npm install
```

to start dev server for vientos-service
```shell
gulp service

```
### vientos-nahual
```shell
cd vientos-nahual
npm install
bower install
cp config.example.json config.json
npm run bundle
```

to start dev server for vientos-nahual
```shell
gulp pwa
```

### full stack
to start both dev servers
```shell
gulp stack
```

### database tasks

if you don't have global gulp
```shell
npm install -g gulp
```

to import fixtures
```shell
gulp import
```

to drop database

```shell
gulp db:drop
```

to see counts of colections in database
```shell
gulp db:stats
```
