import { textToAnchorName } from "./utils";
import showdown from "showdown";

export type Header = {
    depth: number,
    title: string,
    anchor: string
};

const converter = new showdown.Converter();

export function getHeaders(body: string): Header[] {
    const headers: Header[] = [];
    // # header,
    // followed by some title,
    // with an optional {#anchor} tagging at the end
    const rgx = /^(#+) ([\w\s\-\/\@`]*?)( \{#(.*)\})?$/gm;

    let match: RegExpExecArray | null;
    while (match = rgx.exec(body)) {
        const depth = match[1].length;
        const rawTitle = match[2];
        const convertedTitle = converter.makeHtml(rawTitle);
        const title = convertedTitle.substr("<p>".length, convertedTitle.length - "<p></p>".length);

        let anchor: string;
        if (match[4] === undefined) {
            anchor = textToAnchorName(rawTitle);
        } else {
            anchor = match[4];
        }
        headers.push({depth, title, anchor});
    }
    return headers;
}
