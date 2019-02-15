import staticy = require('staticy');
import path = require('path');
import render  = require('./render');
import site = require('./site');

site.create().runDevServer();
