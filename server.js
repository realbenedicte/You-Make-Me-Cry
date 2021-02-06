const WebSocket = require('ws')
const fs = require('fs');
const WebSocketServer = require("ws").Server
const https = require("https")
const http = require("http")
const express = require("express")
const app = express()
const port = process.env.PORT || 8000
app.use(express.static(__dirname + "/"))

let dripToggleState = 0;
let arduinoState = 0;
let dripRate = 10;

// const options = {
//   hostname: 'youmakemecry.com',
//   key: fs.readFileSync('/etc/letsencrypt/live/youmakemecry.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/youmakemecry.com/cert.pem')
// };

//const server = https.createServer(options, app)
const server = http.createServer(app)
server.listen(port)
console.log("http server listening on %d", port)

const wss = new WebSocketServer({
  server: server
})
console.log("websocket server created")

// get websocket connection
wss.on("connection", function(ws) {
  let id = setInterval(function() {
    ws.send("PING", function() {})
  }, 12000)
  console.log("websocket connection open ")
  ws.send(`T,${dripToggleState}`);
  ws.send(`R,${dripRate}`);
  if (arduinoState == 1) {
    ws.send('XX');
  }
  ws.on("message", function(message) {
    console.log("received: %s", message)
    wss.broadcast(message)
    if (message == 'XX') {
      arduinoState = 1;
    } else if (message == 'T,0') {
      dripToggleState = 0;
    } else if (message == 'T,1') {
      dripToggleState = 1;
    } else if (message.startsWith("R")) {
      let value = message.split(',')[1]
      dripRate = value;
    }
  })

  ws.on("close", function() {
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
