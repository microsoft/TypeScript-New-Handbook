import showdown = require("showdown");
import { getCompilerExtension } from "./sample-compiler";
import { textToAnchorName, strrep } from "./utils";
import { getHeaders } from "./header-parser";
import { renderTree } from "./toc";

async function createCompiler() {
    if (createCompiler.cached) {
        return createCompiler.cached;
    }
    return createCompiler.cached = await getCompilerExtension();
}
createCompiler.cached = null! as showdown.ShowdownExtension[];

showdown.extension("header-link", function () {
    return [{
        type: 'html',
        regex: /(<h([1-4]) id="([^"]+?)">)(.*<\/h\2>)/g,
        replace: `$1<a href="#$3">$4</a>`
    }];
});

showdown.extension("toc", function () {
    return [{
        type: "lang",
        regex: /^__toc__$/gm,
        replace(_1: any, _2: any, body: string) {
            const lines = [`<div class="toc"><span class="toc-title">Table of Contents</span>`];

            const headers = getHeaders(body);
            lines.push(renderTree(headers, 2));
            return lines.join("");
        }
    }];
});

showdown.extension("aside", function () {
    return {
        type: 'output',
        regex: /<blockquote>\s*<blockquote>([\s\S]+?)<\/blockquote>\s*<\/blockquote>/g,
        replace: `<aside>$1</aside>`
    };
});

let topicMap: { [name: string]: { link: string, title: string; } | { targets: string[] } } = {};
export function updateTopicTargets(map: typeof topicMap) {
    topicMap = map;
}

showdown.extension("topic-link", function () {
    return [{
        type: "lang",
        regex: /\[\[(.+)\]\]/gm,
        replace(_1: any, topic: string) {
            if (topic in topicMap) {
                const target = topicMap[topic];
                if ('targets' in target) {
                    console.warn(`Ambiguous topic reference ${topic}`);
                    for (const t in target.targets) {
                        console.warn(` -> ${t}`);
                    }
                } else {
                    return `<a href="${target.link}">${target.title}</a>`;
                }
            } else {
                console.warn(`No topic named ${topic} exists`);
                return topic;
            }
        }
    }];
});

export async function render(content: string) {
    const conv = new showdown.Converter({
        customizedHeaderId: true,
        ghCompatibleHeaderId: true,
        ghCodeBlocks: true
    });
    conv.addExtension(await createCompiler(), "ts");
    conv.useExtension("header-link");
    conv.useExtension("toc");
    conv.useExtension("aside");
    conv.useExtension("topic-link");
    return conv.makeHtml(content);
}

export type PageSettings = {
    title: string;
    urlDepth: number;
};

export function makePage(content: string, settings?: Partial<PageSettings>) {
    const st: PageSettings = {
        ...{
            title: "Handbook Page",
            urlDepth: 2
        },
        ...settings
    };

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${st.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" media="screen" href="${strrep("../", st.urlDepth)}css/handbook.css" />
        <script src="${strrep("../", st.urlDepth)}js/handbook.js"></script>
    </head>
    <body class="dark-light">
        <div class="theme-selector">
            Theme:
            <div id="set-theme-light">■</div>
            <div id="set-theme-dark">■</div>
            <div id="set-theme-dark-light">■</div>
            <div id="set-theme-light-dark">■</div>
        </div>
    <article>
    ${content}
    </article>
    </body>
    </html>`;
}
