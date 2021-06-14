import * as MarkdownIt from "markdown-it";
import * as Query from "./Query";
import { WorkspaceCache } from "./WorkspaceCache";

// Reading the following regex is simple if you look at it hierarchically. May
// switch to an actual parser later on:
//    Verse:     (\d+:)?\d+
//    Range:     (\d+:)?\d+(\-(\d+:)?\d+)?
//    Ranges:    ((\d+:)?\d+(\-(\d+:)?\d+)?)(,((\d+:)?\d+(\-(\d+:)?\d+)?))*
//    Book:      (\w+)(\/\w+)*
//    Structure: (!|\?)\[book#ranges\]
const REF_RE = /(!|\?)\[(\w+)(\/\w+)*#((\d+:)?\d+(\-(\d+:)?\d+)?)(,((\d+:)?\d+(\-(\d+:)?\d+)?))*\]/;

export function plugin(md: MarkdownIt, options: object) {
  md.core.ruler.before('normalize', 'include', (state) => {
    let remainder = state.src.slice();
    let target = "";
    let match;
    while (match = REF_RE.exec(remainder)) {
      // Query.parse does syntactic parsing.
      const q = Query.parse(match[0].slice(1));
      // `Source.fetch` tries to really get verses.
      let text = q ? WorkspaceCache.fetch(q) : undefined;

      const refType = match[0][0];
      // If either basic parsing or fetching verses fails, we report this.
      if (!q || !text) {
        text = `<mark>${match[0]}</mark>`;
      } else if (refType === "?") {
        text = Query.toString(q);
      } else if (refType === "!") {
        // Use the text as-is.
      }

      // Append the matched text or marked verse ref.
      target += remainder.slice(0, match.index) + text;
      remainder = remainder.slice(match.index + match[0].length);
    }
    state.src = target + remainder;
    return true;
  });
};