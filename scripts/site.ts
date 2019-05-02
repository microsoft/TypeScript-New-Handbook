import staticy = require('staticy');
import path = require('path');
import fs = require('fs-extra');

import * as render from './render';
import { Outline } from './master-outline-generator';
import { Everything } from './everything-generator';
import { fileNameToUrlName } from './utils';
import { getHeaders } from './header-parser';
import { sassCompiler } from './sass-compiler';

const home = path.join(__dirname, "..");

function changeFileName(fn: string) {
    return `${fileNameToUrlName(fn.replace(/\.md$/, ""))}/index.html`;
}

const renderMarkdownPage: staticy.TextTransform = {
    changeFileName,
    async transform(context) {
        let title: string = context.fileName.replace(/\.md$/, "");
        let h1 = getHeaders(context.content).filter(h => h.depth === 1)[0];
        if (h1 !== undefined) {
            title = h1.title;
        }
        return {
            content: render.makePage(await render.render(context.content), { title })
        };
    }
}

export async function create() {
    const site = staticy.site.createSite({ fileRoot: home });

    site.addDirectory("css/*.scss", { textTransformer: sassCompiler });
    site.addDirectory("css/*.css");
    site.addDirectory("js/*.js");
    site.addDirectory("chapters/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("reference/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("intros/*.md", { textTransformer: renderMarkdownPage });
    site.addDirectory("meta/*.md", { textTransformer: renderMarkdownPage });

    await collectTopicTargets();

    site.addFileProvider({
        async getServerFiles() {
            return [
                Outline,
                Everything
            ];
        }
    });

    return site;
}

async function collectTopicTargets() {
    const topicLinkedPaths = ["chapters", "reference"];
    const topicMap: FirstArg<typeof render.updateTopicTargets> = Object.create(null);
    for (const dir of topicLinkedPaths) {
        for (const file of await fs.readdir(path.join(home, dir))) {
            const fileName = path.join(home, dir, file);
            if (fileName.endsWith(".md")) {
                const content = await fs.readFile(fileName, { encoding: "utf-8" });
                const headers = getHeaders(content);
                for (const h of headers) {
                    const shortFileName = fileNameToUrlName(file.replace(/\.md$/, ""));
                    for (const s of ["#" + h.anchor, h.title, shortFileName + "#" + h.anchor]) {
                        add(s, h.title, `/${dir}/${shortFileName}#${h.anchor}`);
                    }
                }
            }
        }
    }
    render.updateTopicTargets(topicMap);

    function add(shortName: string, title: string, target: string) {
        const entry = topicMap[target];
        if (entry !== undefined) {
            if ('targets' in entry) {
                entry.targets.push(target);
            } else {
                topicMap[shortName] = topicMap[shortName.toLowerCase()] = {
                    targets: [
                        entry.link,
                        target
                    ]
                };
            }
        } else {
            topicMap[shortName] = topicMap[shortName.toLowerCase()] = {
                link: target,
                title: title
            };
        }
    }
}

type FirstArg<T> = T extends (arg: infer R) => void ? R : never;
