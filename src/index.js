const Nes = require('nes')
const client = new Nes.Client('ws://localhost:3000')

fetch('/nes/auth')
  .then(res => res.json())
  .then(res => res.token)
  .then(token => {
    client.connect({ auth: token }, (err) => {
      if (err) { throw err }
      client.request('/donuts', (err, payload) => {
        document.getElementById('socket').innerHTML = JSON.stringify(payload)
      })
      fetch('/donuts')
        .then(res => res.json())
        .then(res => document.getElementById('http').innerHTML = JSON.stringify(res))
    })
  })
