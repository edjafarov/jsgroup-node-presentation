var io = require('socket.io');
var express = require("express");
var app = express.createServer(),
    io = io.listen(app);
var QRCode = require('qrcode');
var PORT=3000;
var dataUrlString = "";
var emitter = require('events').EventEmitter;
var observer = new emitter();

var getNetworkIPs = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

    var exec = require('child_process').exec;
    var cached;
    var command;
    var filterRE;

    switch (process.platform) {
    case 'win32':
    //case 'win64': // TODO: test
        command = 'ipconfig';
        filterRE = /\bIP-[^:\r\n]+:\s*([^\s]+)/g;
        // TODO: find IPv6 RegEx
        break;
    case 'darwin':
        command = 'ifconfig';
        filterRE = /\binet\s+([^\s]+)/g;
        // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
        break;
    default:
        command = 'ifconfig';
        filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
        // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
        break;
    }

    return function (callback, bypassCache) {
        if (cached && !bypassCache) {
            callback(null, cached);
            return;
        }
        // system call
        exec(command, function (error, stdout, sterr) {
            cached = [];
            var ip;
            var matches = stdout.match(filterRE) || [];
            //if (!error) {
            for (var i = 0; i < matches.length; i++) {
                ip = matches[i].replace(filterRE, '$1')
                if (!ignoreRE.test(ip)) {
                    cached.push(ip);
                }
            }
            //}
            callback(error, cached);
        });
    };
})();


var realIp = null;

getNetworkIPs(function (error, ip) {
    console.log(ip);
    realIp = 'http://'+ip+':' + PORT;
    QRCode.toDataURL('http://'+ip[0]+':' + PORT + "/nodeWheel",function(err,url){
    	dataUrlString = url;
	});
    if (error) {
        console.log('error:', error);
    }
}, false);


app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + "/");
    app.set('view engine', 'ejs');
});

app.get('/', function(req, res) {
    res.render('public/ejs/home.ejs', {
        dataUrl:dataUrlString,
        host:realIp
    });
});

app.get('/nodeWheel', function(req, res) {
    res.render('public/ejs/nodeWheel.ejs', {
       host:realIp 
    });
});

app.get('/presentation', function(req, res) {
    res.render('public/ejs/presentation.ejs', {
       host:realIp
    });
});



io.sockets.on('connection', function(socket) {
	console.log("connected");

    socket.on('listen', function() {
        observer.on("previous",function(){
        	socket.emit("previous");
        	
        })
        observer.on("next",function(){
        	socket.emit("next");
        })        
        observer.on("takeControl",function(){
        	socket.emit("takeControl");
        })                
    });

    
    socket.on('takeControl', function() {
        observer.emit("takeControl");
    });

    socket.on('slidePrevious', function() {
        observer.emit("previous");
    });

    socket.on('slideNext', function() {
        observer.emit("next");
    });    
});

app.listen(PORT);






