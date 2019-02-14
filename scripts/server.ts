import staticy = require('staticy');
import path = require('path');
import render  = require('./render');
import site = require('./site');

process.stdin.on("keypress", () => process.exit(0));

site.create().runDevServer();
