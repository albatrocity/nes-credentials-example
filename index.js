const Hapi = require('hapi')
const Path = require('path')
const inert = require('inert')
const nes = require('nes')
const Webpack = require('webpack')
const WebpackPlugin = require('hapi-webpack-plugin')

const server = new Hapi.Server()
const compiler = new Webpack({
  entry: Path.join(__dirname, 'src/index.js')
})

const assets = {
  publicPath: '/public/',
}

server.connection({
  port: 3000,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: Path.join(__dirname, 'public')
    }
  }
})

const authScheme = (server, options) => {
  return {
    authenticate: (request, reply) => {
      return reply.continue({ credentials: { user: 'Homer', id: 1 } })
    }
  }
}

server.auth.scheme('fake', authScheme)
server.auth.strategy('default', 'fake')
server.auth.default('default')

server.register([inert, {
  register: nes,
  options: {
    auth: {
      type: 'token',
    },
  }
}, {
  register: WebpackPlugin,
  options: {compiler, assets}
}], (err) => {
  if (err) { throw err }

  server.route({
    method: 'GET',
    path: '/public/{p*}',
    handler: {
      directory: {
        path: '.',
      },
    },
    config: {
      auth: false,
    },
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file('index.html');
    }
  })

  server.route({
    method: 'GET',
    path: '/donuts',
    handler: function (request, reply) {
      console.log(request.auth);
      reply(request.auth)
    }
  })

  server.start((err) => {
    if (err) { throw err }
    console.log(`Server running at: ${server.info.uri}`)
  })
})
