import fs = require("fs");
import ts = require("typescript");

function cleanMarkdownEscaped(code: string) {
    code = code.replace(/¨D/g, "$");
    code = code.replace(/¨T/g, "~");
    return code;
}

function escapeHtml(text: string) {
    return text.replace(/</g, "&lt;");
}

function strrep(text: string, count: number) {
    let s = "";
    for (let i = 0; i < count; i++) {
        s += text;
    }
    return s;
}

function createLanguageServiceHost(ref: SampleRef): ts.LanguageServiceHost {
    const options: ts.CompilerOptions = {
        allowJs: true,
        skipLibCheck: true,
    };
    const servicesHost: ts.LanguageServiceHost = {
        getScriptFileNames: () => [ref.fileName!],
        getScriptVersion: fileName => ref.fileName === fileName ? "" + ref.versionNumber : "0",
        getScriptSnapshot: fileName => {
            if (fileName === ref.fileName) {
                return ts.ScriptSnapshot.fromString(ref.content);
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
        readDirectory: ts.sys.readDirectory,
    };
    return servicesHost;
}

interface SampleRef {
    fileName: string | undefined;
    versionNumber: number;
    content: string
}

export function getCompilerExtension() {
    const matches: string[] = [];
    let self = false;

    const sampleFileRef: SampleRef = { fileName: undefined, content: "", versionNumber: 0 };
    const lsHost = createLanguageServiceHost(sampleFileRef);
    const caseSensitiveFilenames = lsHost.useCaseSensitiveFileNames && lsHost.useCaseSensitiveFileNames();
    const docRegistry = ts.createDocumentRegistry(caseSensitiveFilenames, lsHost.getCurrentDirectory());
    const ls = ts.createLanguageService(lsHost, docRegistry);
    const compilerOptions = lsHost.getCompilationSettings();
    const ext: showdown.ShowdownExtension[] = [
        {
            type: "lang",
            regex: /```(jsx?|tsx?)\r?\n([\s\S]*?)\r?\n```/g,
            replace: function (_: string, extension: string, code: string) {
                code = cleanMarkdownEscaped(code);

                sampleFileRef.fileName = "input." + extension;
                sampleFileRef.content = code;
                sampleFileRef.versionNumber++;

                const scriptSnapshot = lsHost.getScriptSnapshot(sampleFileRef.fileName);
                const scriptVersion = "" + sampleFileRef.versionNumber;
                docRegistry.updateDocument(sampleFileRef.fileName, compilerOptions, scriptSnapshot!, scriptVersion);

                const syntaxSpans = ls.getEncodedSyntacticClassifications(sampleFileRef.fileName, ts.createTextSpan(0, code.length)).spans;
                const semanticSpans = ls.getEncodedSemanticClassifications(sampleFileRef.fileName, ts.createTextSpan(0, code.length)).spans;
                const errs = ls.getSemanticDiagnostics(sampleFileRef.fileName);
                errs.push(...ls.getSyntacticDiagnostics(sampleFileRef.fileName));

                const parts: string[] = [`<pre class="typescript-code">`];

                const start = code.indexOf("//cut") < 0 ? 0 : code.indexOf("//cut") + 5;
                while (semanticSpans[0] < start) {
                    semanticSpans.shift();
                    semanticSpans.shift();
                    semanticSpans.shift();
                }
                while (syntaxSpans[0] < start) {
                    syntaxSpans.shift();
                    syntaxSpans.shift();
                    syntaxSpans.shift();
                }
                
                for(let i = start; i < code.length; i++) {
                    const endingDiags = errs.filter(diag => (diag.file && diag.file.fileName) === sampleFileRef.fileName && (diag.start! + diag.length! === i));
                    for (const end of endingDiags) {
                        parts.push(`</span>`);
                    }

                    const startingDiags = errs.filter(diag => (diag.file && diag.file.fileName) === sampleFileRef.fileName && (diag.start === i));
                    for (const start of startingDiags) {
                        const messageText = typeof start.messageText === "string" ? start.messageText : start.messageText.messageText;
                        parts.push(`<span class="error"><span class="error-highlight"></span>`);
                    }

                    if (i === semanticSpans[0]) {
                        if (i === syntaxSpans[0]) {
                            // Better hope these overlap the right way lol
                            if (semanticSpans[1] !== syntaxSpans[1]) {
                                throw new Error(
                                    "Semantic and syntactic spans don't overlap. " +
                                    " Either make this script resilient to that or disable semantic classification."
                                );
                            }
                            syntaxSpans.shift();
                            syntaxSpans.shift();
                            syntaxSpans.shift();
                        }
                        i = highlightAndBumpCounter(semanticSpans, parts, code, i);
                    } else if (i === syntaxSpans[0]) {
                        i = highlightAndBumpCounter(syntaxSpans, parts, code, i);
                    }
                    else {
                        parts.push(code.substr(i, 1));
                    }
                }

                if (errs.length > 0) {
                    parts.push(`<hr class="error-divider">`);
                    for (const err of errs) {
                        let errHead = err.messageText;
                        let depth = 0;
                        parts.push(`<div class="listed-error">`);
                        while (true) {
                            const messageText = typeof errHead === "string" ? errHead : errHead.messageText;
                            parts.push(`<div class="error-line">${strrep(`<div class="indent"></div>`, depth)}${escapeHtml(messageText)}</div>`);
                            if (typeof errHead === "string" || errHead.next === undefined) {
                                break;
                            }
                            errHead = errHead.next;
                            depth++;
                        }
                        parts.push(`</div>`);
                    }
                }

                const url = `https://www.typescriptlang.org/play/#src=${encodeURIComponent(code)}`;
                parts.push(`<a class="playground-link" href="${url}">Try</a>`)

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

    function highlightAndBumpCounter(spans: number[], parts: string[], code: string, i: number) {
        const [start, length, kind] = spans;
        parts.push(`<span class="${ts.ClassificationType[kind]}">${code.substr(i, length)}</span>`);
        spans.shift();
        spans.shift();
        spans.shift();
        return i + length - 1;
    }
}
