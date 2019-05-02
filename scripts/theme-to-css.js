// @ts-check
const shiki = require("shiki");
const fs = require("fs");
const path = require("path");

const codeBlock = `
// comment
/* comment */
class typ extends BaseName {
    constructor(vr = "str") {
        /rgx/.mth(name);
    }
}
var vr = 10;
const cnst = true;
let lt = null;
function func(m: type) {
    while (true) {
        return false;
    }
}
`;
const blockMap = {
    "": "def",
    "class": "kw",
    "10": "num",
    "comment": "cmt"
};

async function generateCss() {
    const colorToId = Object.create(null);
    const idToLightColor = Object.create(null);
    const idToDarkColor = Object.create(null);
    const highlighter = await shiki.getHighlighter({ theme: "light_plus" });
    const highdarker = await shiki.getHighlighter({ theme: "dark_plus" });
    const lightTokens = highlighter.codeToThemedTokens(codeBlock, "ts");
    const darkTokens = highdarker.codeToThemedTokens(codeBlock, "ts");

    for (let line = 0; line < lightTokens.length; line++) {
        for (let tok = 0; tok < lightTokens[line].length; tok++) {
            const token = lightTokens[line][tok];
            const darkToken = darkTokens[line][tok];
            if (token.content !== darkToken.content) throw new Error("Dark and light tokenized differently");

            const text = token.content.replace(/\W/g, "");
            const id = (blockMap.hasOwnProperty(text) && blockMap[text]) || text;

            if (Object.values(idToLightColor).indexOf(token.color) < 0) {
                idToLightColor[id] = token.color;
                colorToId[token.color.toUpperCase()] = id;
                idToDarkColor[id] = darkTokens[line][tok].color;
            }
        }
    }

    console.log(`=== Color to Class Name Map ===`);
    console.log(JSON.stringify(colorToId, undefined, 2));

    console.log(`=== SCSS Variables ===`);
    console.log(toCss("$light-", idToLightColor));
    console.log(toCss("$dark-", idToDarkColor));

    function toCss(pfx, obj) {
        return Object.keys(obj).map(k => {
            return `${pfx}${k}: ${obj[k]};`;
        }).join("\r\n");
    }
}

generateCss().then(() => { });

/*
function parseFile(folder, fileName, lookup) {
    const data = require(path.join(folder, fileName));

    if (data.include) {
        parseFile(folder, data.include, lookup);
    }

    if (data.settings) {
        for (const color of data.settings) {
            if (typeof color.scope === "string") {
                lookup[color.scope] = color.settings;
            } else if (color.scope !== undefined) {
                for (const scope of color.scope) {
                    lookup[scope] = color.settings;
                }
            }
        }
    }
}

function rulesToCssBlock(obj) {
    return `{ ${Object.keys(obj).map(k => `${k}: ${obj[k]};`).join(" ")} }`;
}

function go() {
    const lookup = Object.create(null);
    parseFile("../node_modules/shiki-themes/data/vscode/", "dark_plus.json", lookup);

    const cssLookup = Object.create(null);
    const reverseMap = Object.create(null);
    for (const scopeName of Object.keys(lookup)) {
        if (!lookup[scopeName].foreground) continue;

        const css = rulesToCssBlock(lookup[scopeName]);
        if (css in cssLookup) {
            console.log(scopeName);
            if (cssLookup[css].length <= scopeName.length) {
                continue;
            }
        }
        cssLookup[css] = scopeName;
        if (lookup[scopeName].foreground) {
            reverseMap[lookup[scopeName].foreground] = scopeName;
        }

    }

    const cssLines = [];
    for (const cssName of Object.keys(cssLookup)) {
        cssLines.push(`${cssLookup[cssName]} ${cssName}`);
    }

    console.log(JSON.stringify(reverseMap, undefined, 2));
    console.log(cssLines.join("\r\n"));
}

go();
*/