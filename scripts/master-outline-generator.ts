import path = require('path');
import st = require('staticy');
import fs = require('fs-extra');
import { getHeaders } from './header-parser';
import { renderTree } from './toc';
import { fileNameToUrlName } from './utils';
import { makePage } from './render';

const root = path.join(__dirname, "..");

export const Outline: st.ServerFile = {
    serverPath: "outline/index.html",
    description: "Master outline of all chapters and reference modules",
    async generate() {
        return {
            kind: "text",
            async getText() {
                const { chapters } = JSON.parse(await fs.readFile(path.join(root, "structure.json"), { encoding: "utf-8" }));

                const lines: string[] = [];
                lines.push("<ol>");
                for (const ch of chapters) {
                    const url = `/chapters/${fileNameToUrlName(ch)}`;
                    lines.push(`<li><a href="${url}">${ch}</a><ul>`);
                    const chFileName = path.join(root, "chapters", ch) + ".md";
                    const content = await fs.readFile(chFileName, { encoding: "utf-8"});
                    const headers = getHeaders(content);
                    lines.push(renderTree(headers, 2, url));
                }
                lines.push("</ol>");
                return makePage(lines.join(""), { urlDepth: 1 });
            }
        };
    }
};
