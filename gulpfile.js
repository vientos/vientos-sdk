var gulp = require('gulp')

const MONGO_URL = 'mongodb://localhost:27017'
gulp.task('seed:user', (done) => {
  const UserManager = require('vientos/src/managers/user')
  const Bcrypt = require('bcrypt-nodejs')
  const MongoClient = require('mongodb').MongoClient
  let password = 'secret'
  let user = {
    email: 'me@example.org',
    password: Bcrypt.hashSync(password)
  }
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    UserManager.insert(db, user, (doc) => {
      console.log('email:', user.email)
      console.log('password:', password)
      db.close()
      return done()
    })
  })
})

gulp.task('seed:projects', (done) => {
  const ProjectManager = require('vientos/src/managers/project')
  const MongoClient = require('mongodb').MongoClient
  const projects = require('./data/projects.json')
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    Promise.all(projects.map(project => {
      return ProjectManager.insert(db, project, (doc) => { return Promise.resolve(doc) })
    })).then((all) => {
      console.log('imported', all.length, 'projects')
      db.close()
      return done()
    })
  })
})

gulp.task('db:drop', (done) => {
  const MongoClient = require('mongodb').MongoClient
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
  const MongoClient = require('mongodb').MongoClient
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) throw err
    db.collection('users').count()
      .then(count => console.log('users:', count))
      .then(() => db.collection('projects').count())
      .then(count => console.log('projects:', count))
      .then(() => {
        db.close()
        return done()
      })
  })
})

gulp.task('seed', ['seed:user', 'seed:projects'])
