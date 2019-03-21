import { Header } from "./header-parser";

export function renderTree(headers: Header[], startingDepth: number, baseUrl: string = "") {
    const lines: string[] = [];
    let depth = startingDepth - 1;;
    for (const header of headers.filter(h => h.depth >= startingDepth)) {
        let newDepth = header.depth;
        while (depth < newDepth) {
            lines.push("<ul>");
            depth++;
        }
        while (depth > newDepth) {
            lines.push("</ul>");
            depth--;
        }
        lines.push(`<li><a href="${baseUrl}#${header.anchor}">${header.title}</a></li>`);

    }
    while (depth > 0) {
        lines.push("</ul>");
        depth--;
    }
    lines.push("</div>");
    return lines.join("")
}
