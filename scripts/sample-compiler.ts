import fs = require("fs");
import ts = require("typescript");
import utils = require("./utils");

const { strrep, escapeHtml } = utils;

function cleanMarkdownEscaped(code: string) {
    code = code.replace(/¨D/g, "$");
    code = code.replace(/¨T/g, "~");
    return code;
}

function createLanguageServiceHost(ref: SampleRef): ts.LanguageServiceHost {
    const options: ts.CompilerOptions = {
        allowJs: true,
        skipLibCheck: true,
        strict: true
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

type QueryPosition = { kind: "query", position: number, offset: number };
type HighlightPosition = { kind: "highlight", position: number, length: number, description: string };
function filterHighlightLines(arr: string[]): { codeLines: string[], highlights: HighlightPosition[], queries: QueryPosition[] } {
    const codeLines: string[] = [];
    const highlights: HighlightPosition[] = [];
    const queries: QueryPosition[] = [];
    let nextContentOffset = 0;
    let contentOffset = 0;
    for (let i = 0; i < arr.length; i++) {
        const line = arr[i];
        const highlightMatch = /^\s*\^+( .+)?$/.exec(line);
        const queryMatch = /^\s*\^\?$/.exec(line);
        if (queryMatch !== null) {
            const start = line.indexOf("^");
            const position = contentOffset + start;
            queries.push({ kind: "query", offset: start, position });
        } else if (highlightMatch !== null) {
            const start = line.indexOf("^");
            const length = line.lastIndexOf("^") - start + 1;
            const position = contentOffset + start;
            const description = highlightMatch[1] ? highlightMatch[1].trim() : "";
            highlights.push({ kind: "highlight", position, length, description });
        } else {
            codeLines.push(line);
            contentOffset = nextContentOffset;
            nextContentOffset += line.length + 1;
        }
    }
    return { codeLines, highlights, queries };
}

type Tagging = {
    position: number;
    length: number;
    start: string;
    end: string;
};

function filterOut<T>(arr: T[], predicate: (el: T) => boolean) {
    const result: T[] = [];
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            result.push(arr.splice(i, 1)[0]);
            i--;
        }
    }
    return result;
}

function serverSpansToTaggings(arr: number[]) {
    arr = arr.slice();
    const taggings: Tagging[] = [];
    while (arr.length > 0) {
        const [position, length, kind] = arr.splice(0, 3);
        taggings.push({
            position,
            length,
            start: `<span class="${ts.ClassificationType[kind]}">`,
            end: `</span>`
        });
    }
    return taggings;
}

export function getCompilerExtension() {
    const matches: string[] = [];
    let self = false;

    const sampleFileRef: SampleRef = { fileName: undefined, content: "", versionNumber: 0 };
    const lsHost = createLanguageServiceHost(sampleFileRef);
    const caseSensitiveFilenames = lsHost.useCaseSensitiveFileNames && lsHost.useCaseSensitiveFileNames();
    const docRegistry = ts.createDocumentRegistry(caseSensitiveFilenames, lsHost.getCurrentDirectory());
    const ls = ts.createLanguageService(lsHost, docRegistry);
    // const compilerOptions = lsHost.getCompilationSettings();
    const compilerOptions: ts.CompilerOptions = {
        strict: true
    };
    const ext: showdown.ShowdownExtension[] = [
        {
            type: "lang",
            regex: /```(jsx?|tsx?)\r?\n([\s\S]*?)\r?\n```/g,
            replace: function (_: string, extension: string, code: string) {
                code = cleanMarkdownEscaped(code);

                // Remove ^^^^^^ lines from example and store
                const { codeLines, highlights, queries } = filterHighlightLines(code.split(/\r\n?|\n/g));
                code = codeLines.join("\n");

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
                const taggings: Tagging[] = [];
                const pendingEndTags: Tagging[] = [];

                for (const err of errs.filter(d => d.file && d.file.fileName === sampleFileRef.fileName)) {
                    taggings.push({
                        position: err.start!,
                        length: err.length!,
                        start: `<span class="error"><span class="error-highlight"></span>`,
                        end: `</span>`
                    });
                }

                taggings.push(...serverSpansToTaggings(semanticSpans));
                taggings.push(...serverSpansToTaggings(syntaxSpans));

                for (const highlight of highlights) {
                    taggings.push({
                        position: highlight.position,
                        length: highlight.length,
                        start: `<span class="highlight"><span class="highlight-content"></span><span class="highlight-description">${highlight.description}</span>`,
                        end: `</span>`
                    });
                }

                let pendingQuery: QueryPosition | undefined = undefined;
                let pendingQuickInfo: ts.QuickInfo | undefined = undefined;
                for (let i = start; i <= code.length; i++) {
                    const startTags = filterOut(taggings, tag => tag.position === i);
                    // Sort largest-to-smallest so nesting works correctly
                    startTags.sort((a, b) => b.length - a.length);
                    for (const start of startTags) {
                        parts.push(start.start);
                        pendingEndTags.push(start);
                    }

                    // If there's a query here, store its type and stash the result for the next newline or EOF
                    if (pendingQuery === undefined) {
                        pendingQuery = queries.filter(q => q.position === i)[0];
                        if (pendingQuery !== undefined) {
                            pendingQuickInfo = ls.getQuickInfoAtPosition(sampleFileRef.fileName, i);
                        }
                    }

                    parts.push(code[i] || "");

                    const endTags = filterOut(pendingEndTags, tag => tag.position + tag.length - 1 === i);
                    endTags.reverse();
                    for (const end of endTags) {
                        parts.push(end.end);
                    }

                    if ((i === code.length || code[i] === "\n") && pendingQuery !== undefined) {
                        if (code[i] === undefined) {
                            parts.push("\n");
                        }
                        parts.push(strrep(" ", pendingQuery.offset));
                        let displayText: string;
                        if (pendingQuickInfo !== undefined) {
                            const displayParts = pendingQuickInfo.displayParts;
                            if (displayParts !== undefined) {
                                displayText = displayParts.map(d => d.text).join("");
                            } else {
                                displayText = "no display parts here";
                            }
                        } else {
                            displayText = "no quick info here";
                        }
                        parts.push(`<span class="quickinfo-result"><span class="quickinfo-arrow">▲</span>${displayText}</span>`);
                        parts.push(code[i] || "");
                        pendingQuery = undefined;
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
                if (codeLines.length >= 4 + codeLines.indexOf("//cut")) {
                    parts.push(`<a class="playground-link" href="${url}">Try</a>`)
                }

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
