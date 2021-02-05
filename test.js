
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/tty.usbmodem14101', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));// Read the port data

const WebSocket = require('ws');


//const ws = new WebSocket('wss://youmakemecry.com:8000/');
const ws = new WebSocket('ws://localhost:8000/');

ws.on('open', function open() {
  console.log('connected');
  ws.send(Date.now());
});

ws.on('close', function close() {
  console.log('disconnected');
});

ws.on('message', function incoming(data) {

    console.log(data);
    if (data.startsWith('R')){
    	let val =data.split(",")[1];
    	console.log(val);
    	port.write(`${val}\n`);
    }
    else if (data.startsWith('T')){
      port.write(`F`);
    }
});



port.on("open", () => {
  console.log('serial port open');
});
parser.on('data', data =>{
  console.log('got word from arduino:', data);
});
