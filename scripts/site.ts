import staticy = require('staticy');
import path = require('path');
import fs = require('fs-extra');

import render  = require('./render');

const renderMarkdownPage: staticy.TextTransform = {
    changeFileName: fn => fn.replace(/\.md$/, ".html").replace(/ /g, "-").toLowerCase(),
    transform(context) {
        return {
            content: render.makePage(render.render(context.content))
        };
    }
}

export function create() {
    const home = path.join(__dirname, "..");

    const site = staticy.site.createSite({fileRoot: home});

    site.addDirectory("css/*.css");
    site.addDirectory("*.md", { textTransformer: renderMarkdownPage })    

    return site;

}

