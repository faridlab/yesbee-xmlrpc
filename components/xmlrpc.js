/**
* xmlrpc.js components/xmlrpc.js
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
var _ = require('lodash'),
    xmlrpc     = require('xmlrpc'),
    url = require('url'),
    Q = require('q');

module.exports = {

    getXmlrpcService: function() {

        var xmlrpcService = this.context.getService('xmlrpc');
        if (!xmlrpcService) {
            throw new Error('Service "xmlrpc" is not running');
        }

        return xmlrpcService;
    },

    start: function() {
        if (this.type === 'source') {
            this.options = _.defaults(this.options || {}, {exchangePattern: 'inOut'});
            var xmlrpcService = this.getXmlrpcService().attach(this.uri, this);
        }
        this.constructor.prototype.start.apply(this, arguments);
    },

    stop: function() {
        if (this.type === 'source') {
            this.getXmlrpcService().detach(this.uri, this);
        }
        this.constructor.prototype.stop.apply(this, arguments);
    },


    process: function(exchange) {

        // console.log('.. .. ... .. .', this.options);

        if (this.type === 'source') {
            return exchange;
        } else {

            var deferred = Q.defer();
            var parsed = url.parse(this.uri);
            var client = xmlrpc.createClient({host: parsed.hostname, port: parsed.port, cookies: true});

            client.methodCall(this.options.methodName, exchange.headers['xmlrpc::params'] ||  [], function(error, value) {
                // console.log(';;;;;;;;;;;');
                // console.log(value);
                // exchange.body = value;
                // deferred.resolve(exchange);
                deferred.resolve(exchange);
            });



            // if (this.options.proxy) {

            //     if (exchange.body.pipe) {
            //         var resp = exchange.body.pipe(request({method: exchange.body.method, uri: this.uri + exchange.body.url}));
            //         exchange.body = resp;
            //         deferred.resolve(exchange);
            //     } else {
            //         throw new Error('Unimplemented yet!');
            //     }

            // } else {

            //     if(exchange.headers['yesbee-request-method'] == 'GET') {

            //         request(this.uri + exchange.headers['yesbee-translated-uri'], function(err, res, body) {

            //             if (!err && res.statusCode == 200) {
            //                 exchange.body = body;
            //             } else {
            //                 exchange.error = new Error('HTTP error!');
            //                 exchange.error.statusCode = res.statusCode;
            //             }
            //             deferred.resolve(exchange);
            //         });

            //     } else {

            //         var _data = {};

            //         if(typeof exchange.body == "object") _data = exchange.body;

            //         request({
            //             method: exchange.headers['yesbee-request-method'],
            //             uri: this.uri + exchange.headers['yesbee-translated-uri'],
            //             form: _data
            //         }, function(err, res, body) {

            //             if (!err && res.statusCode == 200) {
            //                 exchange.body = body;
            //             } else {
            //                 exchange.error = new Error('HTTP error!');
            //                 exchange.error.statusCode = res.statusCode;
            //             }
            //             deferred.resolve(exchange);
            //         });
            //     }
            // }
            return deferred.promise;
        }
    },

    callback: function(exchange) {
        if (this.type !== 'source') {
            var scope = this.scopes[exchange.id];
            var original = scope.exchange;

            exchange.source = original.source;
            exchange.property('callback', original.property('callback'));

            scope.data.deferred.resolve(exchange);
        }

        return exchange;
    }

};