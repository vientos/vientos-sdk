const gulp = require('gulp')
const server = require('gulp-develop-server')
const browserSync = require('browser-sync').create()
const webpack = require('webpack-stream')
const historyApiFallback = require('connect-history-api-fallback')
const cuid = require('cuid')
const factory = require('factory-girl').factory
const Chance = require('chance')
const shuffle = require('lodash/shuffle')
const data = require('vientos-data')
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vientos-dev'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const MongooseAdapter = require('factory-girl').MongooseAdapter
const schemas = require('./vientos-service/src/models/schemas')
const chance = new Chance()

// service
gulp.task('service:start', () => {
  server.listen({ path: './server.js' })
})

gulp.task('service:restart', () => {
  gulp.watch([ 'vientos-service/src/**/*' ], server.restart)
})

gulp.task('service', ['service:start', 'service:restart'])

// APP

gulp.task('app:browsersync', () => {
  browserSync.init({
    server: './vientos-app',
    middleware: [ historyApiFallback() ],
    port: 8080,
    open: false,
    notify: false
  })
  gulp.watch(['vientos-app/app/**/*', 'vientos-app/index.html', 'vientos-app/bundle.js']).on('change', browserSync.reload)
})

function bundle () {
  console.log('bundling app')
  return gulp.src('src/entry.js')
    .pipe(webpack({
      entry: './vientos-app/src/main.js',
      output: {
        filename: 'bundle.js'
      },
      devtool: 'source-map'
    }))
    .pipe(gulp.dest('vientos-app/'))
}

gulp.task('app:bundle', bundle)

gulp.task('app:bundle:watch', () => {
  gulp.watch([
    'vientos-app/src/**/*',
    'vientos-app/config.json',
    'vientos-app/node_modules/vientos-client/*'
  ]).on('change', bundle)
})

gulp.task('app', ['app:browsersync', 'app:bundle', 'app:bundle:watch'])

// stack
gulp.task('stack', ['service', 'app'])

// factories

function generateLocation () {
  return {
    type: 'Place',
    latitude: chance.latitude({ min: 19.26, max: 19.56 }),
    longitude: chance.longitude({ min: -99.21, max: -99 }),
    address: chance.address()
  }
}

function getRandomId (collection) {
  return shuffle(collection)[0]._id
}

function getRandomIds (collection, quantity = 3) {
  return shuffle(collection).slice(-quantity).map(doc => doc._id)
}

gulp.task('factory', (done) => {
  mongoose.connect(MONGO_URL, { promiseLibrary: global.Promise })
  factory.setAdapter(new MongooseAdapter())

  mongoose.model('Project', schemas.project, 'projects')
  mongoose.model('Intent', schemas.intent, 'intents')

  let collaborationTypes = data.collaborationTypes.map(ct => ct.id)
  factory.define('intent', mongoose.models.Intent, {
    _id: () => { return process.env.OAUTH_CLIENT_DOMAIN + '/intents/' + cuid() },
    type: 'Intent',
    title: () => { return chance.sentence({ words: 6 }).replace('.', '') },
    collaborationType: () => { return chance.pickone(collaborationTypes) },
    direction: () => { return chance.pickone(['offer', 'request']) },
    locations: () => { return chance.d8() > 4 ? [] : [generateLocation()] }
  })

  let categories = data.categories.map(cat => cat.id)
  factory.define('project', mongoose.models.Project, {
    _id: () => { return process.env.OAUTH_CLIENT_DOMAIN + '/projects/' + cuid() },
    type: 'Project',
    name: () => { return chance.sentence({ words: 2 }).replace('.', '') },
    description: () => { return chance.paragraph() },
    logo: () => { return 'https://robohash.org/' + chance.hash() + '?set=set3' },
    categories: () => { return chance.pickset(categories, chance.d4()) },
    locations: () => { return Array.from(Array(chance.d4()), () => generateLocation()) }
  })

  let createdProjects
  factory.createMany('project', 50)
    .then((projects) => {
      createdProjects = projects
      return factory.createMany('intent', 600)
    }).then((intents) => {
      return Promise.all(intents.map(intent => {
        intent.projects = chance.d8() > 6 ? getRandomIds(createdProjects, chance.d4()) : [getRandomId(createdProjects)]
        return intent.save()
      }))
    }).then((intents) => {
      mongoose.disconnect()
      return done()
    }).catch(err => console.log(err))
})
