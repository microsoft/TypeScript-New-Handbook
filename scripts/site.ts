import staticy = require('staticy');
import path = require('path');
import fs = require('fs-extra');

import render = require('./render');
import { Outline } from './master-outline-generator';
import { fileNameToUrlName } from './utils';
import { getHeaders } from './header-parser';

const renderMarkdownPage: staticy.TextTransform = {
    changeFileName: fn => `${fileNameToUrlName(fn.replace(/\.md$/, ""))}/index.html`,
    transform(context) {
        let title: string | undefined;
        let h1 = getHeaders(context.content).filter(h => h.depth === 1)[0];
        if (h1 !== undefined) {
            title = h1.title;
        }
        return {
            content: render.makePage(render.render(context.content), { title })
        };
    }
}

export function create() {
    const home = path.join(__dirname, "..");

    const site = staticy.site.createSite({ fileRoot: home });

    site.addDirectory("css/*.css");
    site.addDirectory("chapters/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("reference/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("intros/*.md", { textTransformer: renderMarkdownPage });
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

