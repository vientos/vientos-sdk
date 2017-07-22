# vientos-sdk
Development environment for vientos stack, it includes as submodules:

* https://github.com/vientos/vientos-app
* https://github.com/vientos/vientos-service

## dependencies
* npm *(see: https://github.com/creationix/nvm)*

### optional
* mongodb
or
* docker *(see: https://www.docker.com/products/overview#/install_the_platform)*
* docker-compose *(see: https://www.docker.com/products/docker-compose)*

## usage

```shell
git submodule init && git submodule update
```
will checkout service and PWA

```shell
npm install
```
will install npm dependencies

```shell
cp env.example env
# edit env if needed
source ./env
```

if you don't have MongoDB, you can use on in docker container
```shell
docker-compose up -d
```
will start container with MongoDB in detached mode


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

1. fork https://github.com/vientos/vientos-service on github
2. set your fork as remote in vientos-service
```shell
cd vientos-service
git fetch origin
git checkout staging
git remote add myfork git@github.com:{MYUSERNAME}/vientos-sdk.git
```
3. for each PR start from origin/staging, make topic branch and push it to your fork
```shell
git checkout staging
git pull origin
git checkout -b myfeature
# edit files and git add
git commit -m 'short description'
git push myfork myfeature
```

### vientos-app
```shell
cd vientos-app
npm install
bower install
cp config.example.json config.json
# edit env if needed
cd .. # back to vientos-sdk
```

to start dev server for vientos-app
```shell
gulp app
```

#### git workflow
same as for vientos-service


### full stack
to start both dev servers
```shell
gulp stack
```

## testing

### selenium

* http://webdriver.io/guide.html
  * http://docs.seleniumhq.org/download/
  * https://github.com/mozilla/geckodriver/releases
