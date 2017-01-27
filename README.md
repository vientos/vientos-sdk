# vientos-sdk
Development environment for vientos stack, it works together with

* https://github.com/ehecame/vientos-nahual
* https://github.com/ehecame/vientos-hapipalapi

## usage

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
