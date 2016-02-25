var express = require('express');
var httpProxy = require('http-proxy');
var cors = require('cors');

var apiForwardingUrl = 'http://10.3.12.211:8082/';
var locRewrite = "http://localhost:8080/";

var server = express();
server.set('port', 8082);
server.use(express.static(__dirname + '/app'));
server.use(cors());

var options = {
  router : {
    'example.com': '127.0.0.1:3001',
    'sample.com': '127.0.0.1:3002',
    '^.*\.sample\.com': '127.0.0.1:3002',
    '.*': '127.0.0.1:3000'
  }
};

var apiProxy = httpProxy.createProxyServer();

apiProxy.on('error', function(e) {
    console.log("Some error happened: " + JSON.stringify(e));
});

apiProxy.on('proxyRes', function (proxyRes, req, res, options) {
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
  //var locationPath = proxyRes.headers.location;
  //console.log("Type of locationPath: " + typeof(locationPath));
  //proxyRes.headers.location = "http://localhost:8082";
  //console.log('RAW Response from the target', + JSON.stringify(proxyRes.headers, true, 2));
  //console.log("This is your culprit: " + locationPath);
  //var fixit  = locationPath.replace("10.3.12.211", "localhost");
  proxyRes.headers.location = proxyRes.headers.location.replace("10.3.12.211", "localhost");
  //console.log("This is the reformed culprit: " + fixit);
  //proxyRes.headers.location = fixit;
  console.log('RAW Response from the target after applying FIXIT: ', JSON.stringify(proxyRes.headers, true, 2));
});

server.all("/*", function (req, res) {
    console.log("Reqest received: " + req);
    apiProxy.web(req, res, {
        target: apiForwardingUrl
        //hostRewrite: locRewrite
    });
});


server.listen(server.get('port'), function () {
    console.log('Proxy server listening on port ' + server.get('port'));
});
