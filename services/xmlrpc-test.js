/**
* Yesbee-Xmlrpc
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

var parser = require('xml2json');

module.exports = function() {

	// this.from('http://localhost:3000?exchangePattern=inOut')
	// 	.to(function(exchange) {
	// 		exchange.body = 'halo dunia';
	// 	});

	// run as Server whinch open socket to client
	this.from('xmlrpc://localhost:3003?methodName=halo&exchangePattern=inOut') // #1
		.to(function(exchange) {
			console.log(exchange.headers['xmlrpc::params']);
			// console.log('exchange.body');
			// console.log(exchange.body);
			exchange.body = exchange.headers['xmlrpc::params'];
			// exchange.body = {biji: 'lebar', batang: 'lentur'};
		});


	this.from('http://localhost:6000?exchangePattern=inOut')
		.to(function(exchange) {

			var xml = "<methodCall><methodName>halo</methodName><params><param><value><string>farid</string></value></param></params></methodCall>";
			var json = parser.toJson(xml); //returns a string containing the JSON structure by default
			exchange.body = json;

			// exchange.headers['xmlrpc::params'] = [{name: 'faridhidayat'}];
			// console.log(exchange.body);
			// exchange.body.push();
			// exchange.body.pipe(process.stdout);
		});
		// .to('xmlrpc://localhost:3003/?methodName=halo');




	this.from('http://localhost:3001?exchangePattern=inOut')
		.to(function(exchange) {
			exchange.headers['yesbee-request-method'] = 'PUT';
			exchange.headers['yesbee-request-multipart'] = true;

			var param = {};
			// get json object and convert to
			exchange.body.on('data', function(data) {
				param = JSON.parse(data.toString());
			});

			var xmlValue = "",
				xml;

			for (var i in param) {
				xmlValue += "<member><name>"+i+"</name><value><string>"+param[i]+"</string></value></member>";
			}

			xml = "<methodCall><methodName>halo</methodName><params><param><value><struct>"+
					xmlValue+
					"</struct></value></param></params></methodCall>";

			exchange.body = xml;

			// exchange.body = "<methodCall><methodName>halo</methodName>"+
			// 				"<params><param><value><struct>"+
			// 				"<member><name>MSISDN</name><value><string>628158788929</string></value></member>"+
			// 				"<member><name>REQUESTID</name><value><string>9344991</string></value></member>"+
			// 				"<member><name>PIN</name><value><string>wn50</string></value></member>"+
			// 				"<member><name>NOHP</name><value><string>515010599387.085655723150</string></value></member>"+
			// 				"<member><name>NOM</name><value><string>TAGPLN</string></value></member>"+
			// 				"<member><name>DATETIME</name><value><dateTime.iso8601>20141106T06:15:01</dateTime.iso8601></value></member>"+
			// 				"<member><name>CITY</name><value><string>URL</string></value></member>"+
			// 				"</struct></value></param></params></methodCall>";

			// exchange.body = '<?xml version="1.0" encoding="iso-8859-1"?> <methodCall><methodName>topUpRequest</methodName><params><param><value><struct><member><name>MSISDN</name><value><string>628158788929</string></value></member><member><name>REQUESTID</name><value><string>9344991</string></value></member><member><name>PIN</name><value><string>wn50</string></value></member><member><name>NOHP</name><value><string>515010599387.085655723150</string></value></member><member><name>NOM</name><value><string>TAGPLN</string></value></member><member><name>DATETIME</name><value><dateTime.iso8601>20141106T06:15:01</dateTime.iso8601></value></member><member><name>CITY</name><value><string>URL</string></value></member></struct></value></param></params></methodCall>';
		})
		.to('http://localhost:3003');

	this.trace = true;
};