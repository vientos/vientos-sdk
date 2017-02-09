const server = require('./vientos-service')
const person = require('vientos-fixtures').people[0]
const PWA_URL = process.env.PWA_URL || 'http://localhost:8080'

server.route({
  method: 'GET',
  path: '/auth/dev',
  config: {
    auth: false,
    handler: (request, reply) => {
      request.cookieAuth.set({ id: person._id })
      reply().redirect(PWA_URL)
    }
  }
})

server.start((err) => {
  if (err) throw err
  console.log('Server running at:', server.info.uri)
})
