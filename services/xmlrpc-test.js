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

module.exports = function() {

	// this.from('http://localhost:3000?exchangePattern=inOut')
	// 	.to(function(exchange) {
	// 		exchange.body = 'halo dunia';
	// 	});

	// run as Server whinch open socket to client
	this.from('xmlrpc://localhost:3003?methodName=halo&exchangePattern=inOut') // #1
		.to(function(exchange) {
			// console.log('exchange.body');
			// console.log(exchange.body);
			exchange.body = exchange.headers['xmlrpc::params'];
			// exchange.body = 'fasd';
		});


	this.from('http://localhost:6000?exchangePattern=inOut')
		.to(function(exchange) {
			exchange.headers['xmlrpc::params'] = [{name: 'faridhidayat'}];
		})
		.to('xmlrpc://localhost:3003/?methodName=halo');



	this.trace = true;
};