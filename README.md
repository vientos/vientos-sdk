# vientos-sdk
Development environment for vientos stack, it includes as submodules:

* https://github.com/ehecame/vientos-pwa
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
cp env.example env
# edit env if needed
source ./env
```

### vientos-service
```shell
cd vientos-service
npm install
cd .. # back to vientos-sdk
```

to start dev server for vientos-service
```shell
gulp service
```

#### git workflow

1. fork https://github.com/ehecame/vientos-service
2. checkout original master and set your fork as remote
```shell
cd vientos-service
git pull origin
git checkout master
git remote add myfork git@github.com:{MYUSERNAME}/vientos-sdk.git
```
3. for each PR start from origin/master, make topic branch and push it to your fork
```shell
git checkout master
git pull origin
git checkout -b myfeature
# edit files and git add
git commit -m 'short description'
git push myfork myfeature
```

### vientos-pwa
```shell
cd vientos-pwa
npm install
bower install
cp config.example.json config.json
# edit env if needed
npm run bundle
cd .. # back to vientos-sdk
```

to start dev server for vientos-pwa
```shell
gulp pwa
```

#### git workflow
same as for vientos-service


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

to see counts for collections in database
```shell
gulp db:stats
```
