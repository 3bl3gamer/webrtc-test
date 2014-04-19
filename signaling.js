var http = require("http");
var WebSocketServer = require('websocket').server;



var server = http.createServer(function(req, res) {
	
}).listen(9000);



var clients = {};

function broadcast(data, except) {
	for (var id in clients) {
		if (clients[id] !== except) clients[id].ws.send(data);
	}
}

function Client(ws) {
	this.fd = ws.socket._handle.fd;
	this.ws = ws;
	console.log("Peer "+this.ws.remoteAddress+" connected");
	clients[this.fd] = this;
}

Client.prototype.send = function(data) {
	this.ws.send(JSON.stringify(data));
}

Client.prototype.leave = function(data) {
	console.log((new Date()) + ' Peer ' + this.ws.remoteAddress + ' disconnected.');
	delete clients[this.fd];
}



var wss = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});
wss.on('request', function(req) {
	//check request.origin
	
	var ws = req.accept(null, req.origin);
	
	ws.on('message', function(msg) {
		if (msg.type === 'binary') return; //ws.sendBytes(message.binaryData);
		if (msg.type !== 'utf8') return; //ws.sendUTF(message.utf8Data);
		var data = JSON.parse(msg.utf8Data);
		console.log(" --- <%s> ----- ", data.type);
		console.log(data.sdp || data.candidate);
		console.log(" --- <%s> ----- \n\n", data.type);
		broadcast(msg.utf8Data, c);
	});
	ws.on('close', function(reasonCode, description) {
		c.leave();
	});
	
	var c = new Client(ws);
	c.send({type:"hello"});
	
}).on('error', function(err) {
	console.log(err);
});

console.log("seems started");
