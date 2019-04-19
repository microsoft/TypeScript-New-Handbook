// @ts-check

const promisify = require("util").promisify;
const markdownlint = require("markdownlint");
const glob = promisify(require("glob"));
const path = require("path");
const fs = require("fs");

const readFile = promisify(fs.readFile);

const markdownConfig = /** @type {import("markdownlint").MarkdownlintConfig} */ (
    require("./markdownlint.json")
);

main().catch(e => console.error("" + e));

async function main() {
    const cwd = __dirname;
    const inputFiles = await glob(path.join(cwd, "../chapters/**/*.md"), {
        cwd,
    });
    const options = {
        files: inputFiles,
        config: markdownConfig
    };

    const result = await promisify(markdownlint)(options);
    console.log(result.toString())
    let exitCode = 0;
    for (const fileErrors of Object.values(result)) {
        exitCode += fileErrors.length;
    }
    inputFiles.map(async fileName => {
        const contents = await readFile(fileName, { encoding: "utf8"});
        checkForImproperlyIndentedFencedCodeBlocks(fileName, contents);
    });
    process.exit(exitCode);
}

/**
 * @param {string} fileName
 * @param {string} text
 */
function checkForImproperlyIndentedFencedCodeBlocks(fileName, text) {
    const lines = text.split(/\r?\n/g);
    let numErrors = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const codeBlockMatch = line.match(/^(\s*)```\S+/);

        if (codeBlockMatch) {
            const startingColumn = codeBlockMatch[1].length;
            if (startingColumn === 0 || startingColumn === getCorrectStartingColumnForLine(lines, i)) {
                continue;
            }

            numErrors++;
            console.log(fileName + ": " +
                        i + 1 + ": A fenced code block following a list item must be indented to the first non-whitespace character of the list item.")
        }
    }

    return numErrors;
}

/**
 * @param {string[]} lines
 * @param {number} lineIndex
 */
function getCorrectStartingColumnForLine(lines, lineIndex) {
    for (let i = lineIndex - 1; i >= 0; i--) {
        const line = lines[i];

        if (line.length === 0) {
            continue;
        }

        let m;
        if (m = line.match(/^\s*([\*\-]|(\d+\.))\s*/)) {
            return m[0].length;
        }
        if (m = line.match(/^(\s*)/)) {
            return m[0].length;
        }
    }

    return 0;
}
