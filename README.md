# vientos-sdk
Development environment for vientos stack, it works together with

* https://github.com/ehecame/vientos-nahual
* https://github.com/ehecame/vientos-hapipalapi

## dependencies

* npm *(see: https://github.com/creationix/nvm)*
* docker *(see: https://www.docker.com/products/overview#/install_the_platform)*
* docker-compose *(see: https://www.docker.com/products/docker-compose)*

### OSX

planned - see [issue#2](https://github.com/ehecame/vientos-sdk/issues/2)

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
npm run seed
```
will seed database with couple example projects and user account with credentials:
* email: *me@example.org*
* password: *secret*


```shell
npm run purge
```
will drop database
