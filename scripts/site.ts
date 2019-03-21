import staticy = require('staticy');
import path = require('path');
import fs = require('fs-extra');

import render = require('./render');
import { Outline } from './master-outline-generator';
import { fileNameToUrlName } from './utils';

const renderMarkdownPage: staticy.TextTransform = {
    changeFileName: fn => `${fileNameToUrlName(fn.replace(/\.md$/, ""))}/index.html`,
    transform(context) {
        return {
            content: render.makePage(render.render(context.content))
        };
    }
}

export function create() {
    const home = path.join(__dirname, "..");

    const site = staticy.site.createSite({ fileRoot: home });

    site.addDirectory("css/*.css");
    site.addDirectory("chapters/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("reference/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("meta/*.md", { textTransformer: renderMarkdownPage });

    site.addFileProvider({
        async getServerFiles() {
            return [
                Outline
            ];
        }
    })

    return site;

}

