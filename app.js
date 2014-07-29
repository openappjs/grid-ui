var mercury = require('mercury');

var Search = require('./');

mercury.app(document.body, Search().state, Search.render);
