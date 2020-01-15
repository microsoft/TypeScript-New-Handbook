import fs = require("fs");
import ts = require("typescript");
import shiki = require("shiki");
import { Highlighter } from "shiki/dist/highlighter";
import utils = require("./utils");
const colorToStyleName = require("./theme-data/vs-light-plus.json");

// Hacking in some internal stuff
declare module "typescript" {
    type Option = {
        name: string;
        type: "list" | "boolean" | "number" | "string" | ts.Map<number>;
        element?: Option;
    }

    const optionDeclarations: Array<Option>;
}

const { strrep, escapeHtml } = utils;

function cleanMarkdownEscaped(code: string) {
    code = code.replace(/¨D/g, "$");
    code = code.replace(/¨T/g, "~");
    return code;
}

function createLanguageServiceHost(ref: SampleRef): ts.LanguageServiceHost & { setOptions(opts: ts.CompilerOptions): void } {
    let options: ts.CompilerOptions = {
        allowJs: true,
        skipLibCheck: true,
        strict: true
    };
    const servicesHost: ReturnType<typeof createLanguageServiceHost> = {
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
        setOptions(newOpts) {
            options = newOpts;
        }
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
function filterHighlightLines(codeLines: string[]): { highlights: HighlightPosition[], queries: QueryPosition[] } {
    const highlights: HighlightPosition[] = [];
    const queries: QueryPosition[] = [];
    let nextContentOffset = 0;
    let contentOffset = 0;
    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        const highlightMatch = /^\s*\^+( .+)?$/.exec(line);
        const queryMatch = /^\s*\^\?\s*$/.exec(line);
        if (queryMatch !== null) {
            const start = line.indexOf("^");
            const position = contentOffset + start;
            queries.push({ kind: "query", offset: start, position });
            codeLines.splice(i, 1);
            i--;
        } else if (highlightMatch !== null) {
            const start = line.indexOf("^");
            const length = line.lastIndexOf("^") - start + 1;
            const position = contentOffset + start;
            const description = highlightMatch[1] ? highlightMatch[1].trim() : "";
            highlights.push({ kind: "highlight", position, length, description });
            codeLines.splice(i, 1);
            i--;
        } else {
            contentOffset = nextContentOffset;
            nextContentOffset += line.length + 1;
        }
    }
    return { highlights, queries };
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

function setOption(name: string, value: string, opts: ts.CompilerOptions) {
    console.log(`Setting ${name} to ${value}`);
    for (const opt of ts.optionDeclarations) {
        if (opt.name.toLowerCase() === name.toLowerCase()) {
            switch (opt.type) {
                case "number":
                case "string":
                case "boolean":
                    opts[opt.name] = parsePrimitive(value, opt.type);
                    break;

                case "list":
                    opts[opt.name] = value.split(',').map(v => parsePrimitive(v, opt.element!.type as string));
                    break;

                default:
                    opts[opt.name] = opt.type.get(value.toLowerCase());
                    console.log(`Set ${opt.name} to ${opts[opt.name]}`);
                    if (opts[opt.name] === undefined) {
                        const keys = Array.from(opt.type.keys() as any);
                        console.error(`Invalid value ${value} for ${opt.name}. Allowed values: ${keys.join(",")}`);
                    }
                    break;
            }
            return;
        }
    }
    console.error(`No compiler setting named ${name} exists!`);
}

const booleanConfigRegexp = /^\/\/\s?@(\w+)$/;
const valuedConfigRegexp = /^\/\/\s?@(\w+):\s?(\w+)$/;
function filterCompilerOptions(codeLines: string[], defaultCompilerOptions: ts.CompilerOptions) {
    const options = { ...defaultCompilerOptions };
    for (let i = 0; i < codeLines.length;) {
        let match;
        if (match = booleanConfigRegexp.exec(codeLines[i])) {
            options[match[1]] = true;
            setOption(match[1], "true", options);
        } else if (match = valuedConfigRegexp.exec(codeLines[i])) {
            setOption(match[1], match[2], options);
        } else {
            i++;
            continue;
        }
        codeLines.splice(i, 1);
    }
    return options;
}


const defaultHandbookOptions = {
    noErrors: false,
    showEmit: false
};
function filterHandbookOptions(codeLines: string[]): typeof defaultHandbookOptions {
    const options: any = { ...defaultHandbookOptions };
    for (let i = 0; i < codeLines.length; i++) {
        let match;
        if (match = booleanConfigRegexp.exec(codeLines[i])) {
            if (match[1] in options) {
                options[match[1]] = true;
                codeLines.splice(i, 1);
                i--;
            }
        } else if (match = valuedConfigRegexp.exec(codeLines[i])) {
            if (match[1] in options) {
                options[match[1]] = match[2];
                codeLines.splice(i, 1);
                i--;
            }
        }
    }
    return options;
}

function shikiSpans(highlighter: Highlighter, code: string, lang: string) {
    const spans: Tagging[] = [];
    const tokens = highlighter.codeToThemedTokens(code, lang);
    let i = 0;
    for (const line of tokens) {
        for (const token of line) {
            if (token.color) {
                const styleName = colorToStyleName[token.color.toUpperCase()];
                if (styleName !== "def") {
                    spans.push({
                        position: i,
                        length: token.content.length,
                        start: `<span class="tm-${styleName}">`,
                        end: `</span>`
                    });
                }
            }
            i += token.content.length;
        }
        // \n
        i++;
    }
    return spans;
}

export async function getCompilerExtension() {
    const matches: string[] = [];
    let self = false;

    const highlighter = await shiki.getHighlighter({ theme: "light_plus" });

    const sampleFileRef: SampleRef = { fileName: undefined, content: "", versionNumber: 0 };
    const lsHost = createLanguageServiceHost(sampleFileRef);
    const caseSensitiveFilenames = lsHost.useCaseSensitiveFileNames && lsHost.useCaseSensitiveFileNames();
    const docRegistry = ts.createDocumentRegistry(caseSensitiveFilenames, lsHost.getCurrentDirectory());
    const ls = ts.createLanguageService(lsHost, docRegistry);
    const defaultCompilerOptions: ts.CompilerOptions = {
        strict: true,
        target: ts.ScriptTarget.ESNext,
        allowJs: true
    };
    const ext: showdown.ShowdownExtension[] = [
        {
            type: "lang",
            regex: /```(jsx?|tsx?)\r?\n([\s\S]*?)\r?\n```/g,
            replace: function (_: string, extension: string, code: string) {
                code = cleanMarkdownEscaped(code);

                const codeLines = code.split(/\r\n?|\n/g);

                const handbookOptions = filterHandbookOptions(codeLines);
                const compilerOptions = filterCompilerOptions(codeLines, { ...defaultCompilerOptions });
                lsHost.setOptions(compilerOptions);

                // Remove ^^^^^^ lines from example and store
                const { highlights, queries } = filterHighlightLines(codeLines);
                code = codeLines.join("\n");

                sampleFileRef.fileName = "input." + extension;
                sampleFileRef.content = code;
                sampleFileRef.versionNumber++;

                const scriptSnapshot = lsHost.getScriptSnapshot(sampleFileRef.fileName);
                const scriptVersion = "" + sampleFileRef.versionNumber;
                docRegistry.updateDocument(sampleFileRef.fileName, compilerOptions, scriptSnapshot!, scriptVersion);

                const semanticSpans = ls.getEncodedSemanticClassifications(sampleFileRef.fileName, ts.createTextSpan(0, code.length)).spans;
                const errs = [];
                if (!handbookOptions.noErrors) {
                    errs.push(...ls.getSemanticDiagnostics(sampleFileRef.fileName));
                    errs.push(...ls.getSyntacticDiagnostics(sampleFileRef.fileName));
                }

                const parts: string[] = [`<pre class="typescript-code">`];

                const start = code.indexOf("//cut") < 0 ? 0 : code.indexOf("//cut") + 5;
                const taggings: Tagging[] = [];
                const pendingEndTags: Tagging[] = [];

                for (const err of errs.filter(d => d.file && d.file.fileName === sampleFileRef.fileName)) {
                    const text = escapeHtml(ts.flattenDiagnosticMessageText(err.messageText, "\n"));
                    const tooltipId = `errLabel-${err.code}-${err.start}-${err.length}`
                    taggings.push({
                        position: err.start!,
                        length: err.length!,
                        start: `<span class="error" tabindex="0" aria-describedby="${tooltipId}"><span class="error-highlight"></span>`,
                        end: `<span id="${tooltipId}" role="tooltip" class="error-tooltip">${text}</span></span>`
                    });
                }

                for (const highlight of highlights) {
                    taggings.push({
                        position: highlight.position,
                        length: highlight.length,
                        start: `<span class="highlight"><span class="highlight-content"></span><span class="highlight-description">${highlight.description}</span>`,
                        end: `</span>`
                    });
                }

                taggings.push(...shikiSpans(highlighter, code, "ts"));
                taggings.push(...serverSpansToTaggings(semanticSpans));

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
                                displayText = displayParts.map(d => `<span class="${d.kind}">${d.text}</span>`).join("");
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

                if (handbookOptions.showEmit) {
                    parts.push(`<hr class="js-divider">`);
                    parts.push(`<pre class="emitted-js">`);
                    parts.push(ls.getEmitOutput(sampleFileRef.fileName).outputFiles[0].text);
                    parts.push(`</pre>`);
                }

                const url = `https://www.typescriptlang.org/play/#src=${encodeURIComponent(code)}`;
                if (codeLines.length >= 4 + codeLines.indexOf("//cut")) {
                    parts.push(`<a class="playground-link" href="${url}" target="_blank">Try</a>`)
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
}

function parsePrimitive(value: string, type: string): any {
    switch (type) {
        case "number": return +value;
        case "string": return value;
        case "boolean": return (value.toLowerCase() === "true") || (value.length === 0);
    }
    throw new Error(`Unknown primitive type ${type}`);
}
