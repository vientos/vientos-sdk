const gulp = require('gulp')
const server = require('gulp-develop-server')
const browserSync = require('browser-sync').create()
const historyApiFallback = require('connect-history-api-fallback')
const MongoClient = require('mongodb').MongoClient
const MongoObjectId = require('mongodb').ObjectId
const fixtures = require('vientos-fixtures')
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vientos-dev'

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
    server: './vientos-nahual',
    middleware: [ historyApiFallback() ],
    port: 8080,
    open: false,
    notify: false
  })
  gulp.watch('vientos-nahual/app/**/*').on('change', browserSync.reload)
})

// stack
gulp.task('stack', ['service', 'pwa'])

// database

function wrapObjectIds (array) {
  return array.map(doc => {
    doc._id = new MongoObjectId(doc._id)
    if (doc.admins) {
      doc.admins = doc.admins.map(id => new MongoObjectId(id))
    }
    return doc
  })
}

gulp.task('import:people', (done) => {
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.collection('people').insert(wrapObjectIds(fixtures.people))
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
    db.collection('projects').insert(wrapObjectIds(fixtures.projects))
      .then(() => {
        console.log('projects imported')
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
      .then(() => {
        db.close()
        return done()
      })
  })
})

gulp.task('import', ['import:people', 'import:projects'])
