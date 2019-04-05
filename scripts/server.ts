import staticy = require('staticy');
import path = require('path');
import render  = require('./render');
import site = require('./site');

async function go() {
    (await site.create()).runDevServer();
}

go();