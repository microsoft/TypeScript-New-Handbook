import path = require('path');
import st = require('staticy');
import fs = require('fs-extra');
import { getHeaders } from './header-parser';
import { renderTree } from './toc';
import { fileNameToUrlName } from './utils';
import { makePage, render } from './render';

const root = path.join(__dirname, "..");

export const Everything: st.ServerFile = {
    serverPath: "everything/index.html",
    description: "*All* of the content, in one enormous file",
    async generate() {
        return {
            kind: "text",
            async getText() {
                const { chapters } = JSON.parse(await fs.readFile(path.join(root, "structure.json"), { encoding: "utf-8" }));

                const parts: string[] = [];
                
                for (const ch of chapters) {
                    const chFileName = path.join(root, "chapters", ch) + ".md";
                    const content = await fs.readFile(chFileName, { encoding: "utf-8"});
                    parts.push(render(content));
                }
                return makePage(parts.join("<hr>"), { urlDepth: 1 });
            }
        };
    }
};
