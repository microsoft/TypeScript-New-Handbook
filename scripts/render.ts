import showdown = require("showdown");
import fs = require("fs");
import path = require("path");
import { getCompilerExtension } from "./sample-compiler";

const sampleCompiler = getCompilerExtension();

showdown.extension("header-link", function () {
    return [{
        type: 'html',
        regex: /(<h([1-3]) id="([^"]+?)">)(.*<\/h\2>)/g,
        replace: `$1<a href="#$3">$4</a>`
    }];
});

showdown.extension("toc", function () {
    const converter = new showdown.Converter();
    return [{
        type: "lang",
        regex: /^__toc__$/gm,
        replace(_1: any, _2: any, body: string) {
            const rgx = /^(##+) ([\w\s\-\/\@`]*)( \{#(.*)\})?$/gm;
            let match: RegExpExecArray | null;
            const lines = [`<div class="toc"><span class="toc-title">Table of Contents</span>`];
            let depth = 1;
            while (match = rgx.exec(body)) {
                let newDepth = match[1].length;
                while (depth < newDepth) {
                    lines.push("<ul>");
                    depth++;
                }
                while (depth > newDepth) {
                    lines.push("</ul>");
                    depth--;
                }
                let anchorName = textToAnchorName(match[2]);
                if (match[4] !== undefined) {
                    anchorName = match[4];
                }
                let converted = converter.makeHtml(match[2]);
                // remove leading/trailing p
                converted = converted.substr("<p>".length, converted.length - "<p></p>".length);
                lines.push(`<li><a href="#${anchorName}">${converted}</a></li>`);
            }
            while (depth > 0) {
                lines.push("</ul>");
                depth--;
            }
            lines.push("</div>")
            return lines.join("");
        }
    }];
});

function textToAnchorName(text: string) {
    return text.toLowerCase().replace(/ /g, "-").replace(/`/g, "");
}

export function render(content: string) {
    const conv = new showdown.Converter({
        customizedHeaderId: true,
        ghCompatibleHeaderId: true,
        ghCodeBlocks: true
    });
    conv.addExtension(sampleCompiler, "ts");
    conv.useExtension("header-link");
    conv.useExtension("toc");
    return conv.makeHtml(content);
}

export function makePage(content: string) {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Handbook Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" media="screen" href="../css/handbook.css" />
    </head>
    <body>
    <article>
    ${content}
    </article>

    <script src="https://unpkg.com/popper.js@1/dist/umd/popper.min.js"></script>
    <script src="https://unpkg.com/tippy.js@4"></script>
    <script>
        tippy.setDefaults({preventOverflow: { enabled: false } });
    </script>
    </body>
    </html>`;
}

const home = path.join(__dirname, "..");
function processFile(fileName: string) {
    fs.readFile(fileName, { encoding: "utf-8" }, (err, data) => {
        if (err) throw err;

        const fileOnly = path.basename(fileName);
        const output = makePage(render(data));
        fs.writeFile(path.join(__dirname, "../bin", fileOnly.replace(".md", ".html")), output, err => { if (err) throw err; });
    });
}

function run() {
    fs.readdir(home, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            if (file.indexOf(".md") > 0) {
                processFile(file);
            }
        }
        console.log(files.join(","));
    });
}

function watch() {
    fs.watch(home, {}, (event, fileName) => {
        if (fileName.endsWith(".md")) {
            console.log(`Update ${fileName}`);
            processFile(fileName);
        }
    });
}
