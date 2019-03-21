import path = require('path');
import st = require('staticy');
import fs = require('fs-extra');
import { getHeaders } from './header-parser';

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
                let depth = 1;
                for (const ch of chapters) {
                    lines.push(`<li>${ch}<ul>`);
                    const chFileName = path.join(root, "chapters", ch) + ".md";
                    const content = await fs.readFile(chFileName, { encoding: "utf-8"});
                    const headers = getHeaders(content);
                    for (const header of headers) {
                        while (depth < header.depth) {
                            lines.push("<ul>");
                            depth++;
                        }
                        while (depth > header.depth) {
                            lines.push("</ul>");
                            depth--;
                        }        
                        lines.push(`<li>${header.title}</li>`);
                    }
                    while (depth > 1) {
                        lines.push("</ul>");
                        depth--;
                    }
                    lines.push(`</li></ul>`);
                }
                lines.push("</ol>");
                return lines.join("\r\n");
            }
        };
    }
};
