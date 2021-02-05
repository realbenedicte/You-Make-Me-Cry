const WebSocket = require('ws')
const WebSocketServer = require("ws").Server
const http = require("http")
const express = require("express")
const app = express()
const port = process.env.PORT || 8000

app.use(express.static(__dirname + "/"))

const server = http.createServer(app)
server.listen(port)
console.log("http server listening on %d", port)

const wss = new WebSocketServer({ server: server })
console.log("websocket server created")

// get websocket connection
wss.on("connection", function (ws) {
  let id = setInterval(function () {
    console.log("send ping: C")
    ws.send("PING", function () {})
  }, 12000)
  console.log("websocket connection open ")

  ws.on("message", function (message) {
    console.log("received: %s", message)
    wss.broadcast(message)
  })

  ws.on("close", function () {
    console.log("websocket connection close")
    clearInterval(id)
  })

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    })
  }
})
