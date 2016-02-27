var express = require('express');
var httpProxy = require('http-proxy');
var cors = require('cors');

var apiForwardingUrl = 'http://10.3.12.211:8082/';
var webForwardingUrl = 'http://10.3.12.211:8080/';

var authServer = express();
authServer.set('port', 8082);
authServer.use(express.static(__dirname + '/app'));
authServer.use(cors());

var webServer = express();
webServer.set('port', 8080);
webServer.use(express.static(__dirname + '/app'));
webServer.use(cors());

var authProxy = httpProxy.createProxyServer();
var webProxy = httpProxy.createProxyServer();

authProxy.on('error', function(e) {
    console.log("Auth Proxy => Some error happened: " + JSON.stringify(e));
});

webProxy.on('error', function(e) {
    console.log("Web Proxy => Some error happened: " + JSON.stringify(e));
})

authProxy.on('proxyRes', function (proxyRes, req, res, options) {
  //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
  //console.log("This is the location header value: " + proxyRes.headers.location);
  if (proxyRes.headers.location) {
      console.log("Location found, so operating: " + proxyRes.headers.location);
      proxyRes.headers.location = proxyRes.headers.location.replace("10.3.12.211", "localhost");
  }
});

authServer.all("/*", function (req, res) {
    console.log("Reqest received: " + req);
    authProxy.web(req, res, {
        target: apiForwardingUrl
        //hostRewrite: locRewrite
    });
});


webServer.all('/*', function (req, res) {
    console.log("Reqest received: " + req);
    webProxy.web(req, res, {
        target: webForwardingUrl
  });
});


authServer.listen(authServer.get('port'), function () {
    console.log('Auth proxy server listening on port ' + authServer.get('port'));
});

webServer.listen(webServer.get('port'), function () {
    console.log('Auth proxy server listening on port ' + webServer.get('port'));
});
