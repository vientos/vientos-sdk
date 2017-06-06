const cuid = require('cuid')
const server = require('./vientos-service')
const Person = require('./vientos-service/src/models/person')
const PWA_URL = process.env.PWA_URL || 'http://localhost:8080'

const handler = function (request, reply) {
  let query = Person.findOne({})
  if (request.params.id) {
    let iri = process.env.OAUTH_CLIENT_DOMAIN + '/people/' + request.params.id 
    query = Person.findOne({ _id: iri })
  }
  query.then(person => {
    request.cookieAuth.set({
      id: person._id,
      sessionId: cuid()
    })
    reply().redirect(PWA_URL)
  })
}

server.route([{
  method: 'GET',
  path: '/auth/dev',
  config: {
    auth: false,
    handler
  }
}, {
  method: 'GET',
  path: '/auth/dev/{id}',
  config: {
    auth: false,
    handler
  }
}])

server.start((err) => {
  if (err) throw err
  console.log('Server running at:', server.info.uri)
})
