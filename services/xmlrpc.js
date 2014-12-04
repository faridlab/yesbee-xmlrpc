/**
* xmlrpc.js services/xmlrpc.js
*
* MIT LICENSE
*
* Copyright (c) 2014 PT Sagara Xinix Solusitama - Xinix Technology
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* @author Farid Hidayat <e.faridhidayat@gmail.com>
* @copyright 2014 PT Sagara Xinix Solusitama
*/

var url = require('url'),
    Q = require('q'),
    Deserializer     = require('xmlrpc/lib/deserializer'),
    Serializer     = require('xmlrpc/lib/serializer'),
    logger,
    Exchange,
    Channel;

var XMLRPCWrapper = function(context, uri) {

    var that = this;
    var parsed = url.parse(uri);
    this.id = parsed.protocol + '//' + parsed.hostname + ':' + parsed.port;
    this.context = context;
    this.callbackChannel = this.context.getChannelId(Channel.OUT, this);

    // console.log(this.callbackChannel);
    this.context.on(this.callbackChannel, function(exchange) {
        // console.log('cccccc', exchange);
        Q(that.callback(exchange)).fail(function(e) {
            logger.e(e.message + "\n" + e.stack);
        });

    });


    this.handlers = {};
    this.scopes = {};
    this.context = context;

    var httpServiceHTTP = this.context.getService('http'),
        httpWrapper = httpServiceHTTP.get(uri);

    this.server = httpWrapper.server;


    // cache and clean up listeners
    var listeners = this.server.listeners('request').slice(0);
    this.server.removeAllListeners('request');
    // this.server.on('close', self.close.bind(self));

    var deserializer = new Deserializer();

    this.server.on('request', function(req, res) {


        deserializer.deserializeMethodCall(req, function(error, methodName, params) {

            if (!error ) {

                var handler = that.handlers[req.url + '::'+ methodName];
                if (handler) {

                    var exchange = new Exchange();
                    // console.log('XXXXXX', that.callbackChannel);
                    exchange.headers['xmlrpc::methodName'] = methodName;
                    exchange.headers['xmlrpc::params'] = params;

                    exchange.property('callback', that.callbackChannel);
                    that.addScope(exchange, req, res);
                    that.context.send(Channel.IN, handler, exchange, that.context);

                    return;
                }

            }

            for (var i = 0, l = listeners.length; i < l; i++) {
                listeners[i].call(httpWrapper.server, req, res);
            }

        });


    });


};

XMLRPCWrapper.prototype = {

    addHandler: function(pathname, methodName, handler) {
        this.handlers[pathname + '::' + methodName] = handler;
    },

    // normalizePath: function(pathname) {
    //     pathname = pathname.trim();

    //     if (pathname === '/') {
    //         return pathname;
    //     }

    //     return pathname.replace(/\/+$/, '');
    // },

    // route: function(pathname, handler) {
    //     pathname = this.normalizePath(pathname);
    //     this.routes[pathname] = handler;
    //     logger.i(this.context.id, 'add route ' + pathname + ' on ' + this.hostname + ':' + this.port);
    // },

    // deroute: function(pathname, handler) {
    //     pathname = this.normalizePath(pathname);
    //     var existingHandler = this.routes[pathname];

    //     if (existingHandler === handler) {
    //         delete this.routes[pathname];
    //     }
    //     logger.i(this.context.id, 'delete route ' + pathname + ' on ' + this.hostname + ':' + this.port);
    // },


    addScope: function(exchange, req, res) {
        this.scopes[exchange.id] = {
            request: req,
            response: res,
            exchange: exchange
        };
    },

    callback: function(exchange) {
        var scope = this.scopes[exchange.id];

        if (exchange.error) {
            if (exchange.error.statusCode) {
                scope.response.writeHead(exchange.error.statusCode);
            } else {
                scope.response.writeHead(500);
            }
            scope.response.end(JSON.stringify({error:exchange.error.message}));
        } else {
            // TODO: on parse error return error object
            var xml = Serializer.serializeMethodResponse(exchange.body);
            scope.response.writeHead(200, {'Content-Type': 'text/xml'});
            scope.response.write(xml);
            scope.response.end();
        }
    },

};

module.exports = function(yesbee) {

    logger = yesbee.logger;
    Exchange = yesbee.Exchange;
    Channel = yesbee.Channel;

    this.handlers = {};
    this.servers = {};

    this.trace = true;

    // this.normalizePath = function(pathname) {
    //     pathname = pathname.trim();
    //     if (pathname === '/') {
    //         return pathname;
    //     }
    //     return pathname.replace(/\/+$/, '');
    // };

    this.get = function(uri) {

        var that = this,
            parsed = url.parse(uri),
            pathname = parsed.pathname,
            xmlrpcWrapper = this.servers[parsed.host];

        if (!this.servers[parsed.host]) {
            xmlrpcWrapper = new XMLRPCWrapper(this, uri);
            this.servers[parsed.host] = xmlrpcWrapper;
        }

        return xmlrpcWrapper;
    };

    this.attach = function(uri, component) {
        var parsed = url.parse(uri);
        this.get(uri).addHandler(parsed.pathname || '/', component.options.methodName, component);
    };

    // this.detach = function(uri, component) {
    //     var parsed = url.parse(uri);
    //     this.get(uri).removeHandler(parsed.pathname || '/', component.options.methodName, component);
    // };

    // this.removeHandler = function(pathname, methodName, handler) {
    //     pathname = this.normalizePath(pathname);
    //     var existingHandler = this.servers[pathname];
    //     if (existingHandler === handler) {
    //         delete this.servers[pathname];
    //     }
    //     logger.i(this.context.id, 'delete handler ' + pathname + ' on ' + this.hostname + ':' + this.port);
    // };

};