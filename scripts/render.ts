import showdown = require("showdown");
import ts = require("typescript");
import fs = require("fs");
import path = require("path");

function cleanMarkdownEscaped(code: string) {
    code = code.replace(/¨D/g, "$");
    code = code.replace(/¨T/g, "~");
    return code;
}

const sampleFileName = "sample.ts";
function createLanguageServiceHost(content: string): ts.LanguageServiceHost {
    const options: ts.CompilerOptions = {

    };
    const servicesHost: ts.LanguageServiceHost = {
        getScriptFileNames: () => [sampleFileName],
        getScriptVersion: fileName => "1",
        getScriptSnapshot: fileName => {
            if (fileName === sampleFileName) {
                return ts.ScriptSnapshot.fromString(content);
            }
            if (!fs.existsSync(fileName)) {
                return undefined;
            }

            return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
        },
        getCurrentDirectory: () => process.cwd(),
        getCompilationSettings: () => options,
        getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory
    };
    return servicesHost;
}

function getCompilerExtension() {
    const evalFileName = 'input.ts';
    const matches: string[] = [];
    let self = false;
    const ext: showdown.ShowdownExtension[] = [
        {
            type: "lang",
            regex: /```ts\r?\n([\s\S]*?)\r?\n```/g,
            replace: function (match: string, code: string) {
                code = cleanMarkdownEscaped(code);
                const src = ts.createSourceFile("input.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
                const lsHost = createLanguageServiceHost(code);
                const ls = ts.createLanguageService(lsHost);
                const spans = ls.getEncodedSyntacticClassifications(sampleFileName, ts.createTextSpan(0, code.length));
                const errs = ls.getSemanticDiagnostics(sampleFileName);
                errs.push(...ls.getSyntacticDiagnostics(sampleFileName));

                const parts: string[] = [`<pre class="typescript-code">`];
                
                const currentToken = 0;
                let pendingDiagnosticEnd = -1;
                for(let i = 0; i < code.length; i++) {
                    const endingDiags = errs.filter(diag => (diag.file && diag.file.fileName) === sampleFileName && (diag.start! + diag.length! === i));
                    for (const end of endingDiags) {
                        parts.push(`</span>`);
                    }

                    const startingDiags = errs.filter(diag => (diag.file && diag.file.fileName) === sampleFileName && (diag.start === i));
                    for (const start of startingDiags) {
                        const messageText = typeof start.messageText === "string" ? start.messageText : start.messageText.messageText;
                        parts.push(`<span class="error" title="${messageText.replace(/"/g, "&gt;")}">`);
                    }

                    if (i === spans.spans[0]) {
                        const [start, length, kind] = spans.spans;
                        parts.push(`<span class="${ts.ClassificationType[kind]}">${code.substr(i, length)}</span>`);
                        spans.spans.shift();
                        spans.spans.shift();
                        spans.spans.shift();
                        i += length - 1;
                    } else {
                        parts.push(code.substr(i, 1));
                    }
                }
                const url = `https://www.typescriptlang.org/play/#src=${encodeURIComponent(code)}`;
                parts.push(`<a class="playground-link" href="${url}">Try in Playground</a>`)
                parts.push("</pre>");
                
                return "%FCODERENDER" + (matches.push(parts.join("")) - 1) + "%";
            }
        },
        {
            type: "output",
            filter: function (text, converter) {
                if (self)
                    return text;
                for (var i = 0; i < matches.length; i++) {
                    var code = "%FCODERENDER" + i + "%";
                    self = true;
                    text = text.replace(new RegExp(code, 'gi'), matches[i]);
                    self = false;
                }
                self = false;
                matches.length = 0;
                return text;
            }
        }
    ];
    return ext;
}

export function render(content: string) {
    const conv = new showdown.Converter();
    conv.addExtension(getCompilerExtension(), "ts");
    // conv.useExtension("ts");
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
        <link rel="stylesheet" type="text/css" media="screen" href="handbook.css" />
    </head>
    <body>${content}</body>
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

/*
run();
if (process.argv.some(s => s === "-w")) {
    watch();
}
*/