const gulp = require('gulp')
const server = require('gulp-develop-server')
const browserSync = require('browser-sync').create()
const historyApiFallback = require('connect-history-api-fallback')
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const cuid = require('cuid')
const factory = require('factory-girl').factory
const Chance = require('chance')
const shuffle = require('lodash/shuffle')
const fixtures = require('vientos-fixtures')
const data = require('vientos-data')
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vientos-dev'
const MongoClient = require('mongodb').MongoClient
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

// PWA

gulp.task('pwa', () => {
  browserSync.init({
    server: './vientos-pwa',
    middleware: [ historyApiFallback() ],
    port: 8080,
    open: false,
    notify: false
  })
  gulp.watch(['vientos-pwa/app/**/*', 'vientos-pwa/bundle.js']).on('change', browserSync.reload)
  gulp.watch(['vientos-pwa/src/**/*', 'vientos-pwa/config.json']).on('change', () => {
    console.log('auto-bundling ;)')
    return browserify({
      entries: ['vientos-pwa/src/main.js'],
      debug: true
    }).transform(babelify.configure({
      presets: ['es2015'],
      plugins: ['transform-object-rest-spread']
    })).bundle().pipe(source('bundle.js')).pipe(gulp.dest('vientos-pwa/'))
  })
})

// stack
gulp.task('stack', ['service', 'pwa'])

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

// database

function namespaceIds (collection) {
  let prefix = process.env.OAUTH_CLIENT_DOMAIN + '/'
  let path = collection + '/'
  return fixtures[collection].map(doc => {
    if (!doc._id) doc._id = cuid()
    doc._id = prefix + path + doc._id
    if (doc.admins) {
      doc.admins = doc.admins.map(id => prefix + 'people/' + id)
    }
    if (doc.projects) {
      doc.projects = doc.projects.map(id => prefix + 'projects/' + id)
    }
    return doc
  })
}

gulp.task('import:people', (done) => {
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.collection('people').insert(namespaceIds('people'))
      .then(() => {
        console.log('people imported')
        db.close()
        return done()
      })
  })
})

gulp.task('import:projects', (done) => {
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.collection('projects').insert(namespaceIds('projects'))
      .then(() => {
        console.log('projects imported')
        db.close()
        return done()
      })
  })
})

gulp.task('import:intents', (done) => {
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.collection('intents').insert(namespaceIds('intents'))
      .then(() => {
        console.log('intents imported')
        db.close()
        return done()
      })
  })
})

gulp.task('db:drop', (done) => {
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.dropDatabase().then(() => {
      console.log('database dropped')
      db.close()
      return done()
    })
  })
})

gulp.task('db:stats', (done) => {
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.collection('people').count()
      .then(count => console.log('people:', count))
      .then(() => db.collection('projects').count())
      .then(count => console.log('projects:', count))
      .then(() => db.collection('intents').count())
      .then(count => console.log('intents:', count))
      .then(() => {
        db.close()
        return done()
      })
  })
})

gulp.task('import', ['import:people', 'import:projects', 'import:intents'])
