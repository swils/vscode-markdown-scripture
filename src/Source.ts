import * as _ from "lodash";
import * as MarkdownIt from "markdown-it";
import * as vscode from "vscode";
import * as Query from "./Query";

// Keep a copy to a single MarkdownIt parser object.
const PARSER = new MarkdownIt();

// Regular expressions for chapter and verse designators.
const CHAPTER_REGEX = /<!--\s+scripture\:(\d+)\s+-->/;
const VERSE_REGEX = /\[(\d+)\]\s*([^\[]*)/;

interface Fragment {
  [key: string]: string | Fragment | undefined
}

/**
 * Since this object will be stored in a Memento object as JSON, we don't use a
 * class for this.
 */
export interface Source {
  fragments: Fragment;
}

export function create(document: vscode.TextDocument): Source {
  const fragments: Fragment = { };
  let currentChapter: Fragment | undefined;

  // TODO: this code is not robust. It makes a lot of assumptions about edge
  // cases not occurring, e.g. that an inline token contains either a single
  // title annotation or verses. Or that verses do not span multiple inline
  // spans etc.
  const tokens = PARSER.parse(document.getText(), { });
  for (const token of tokens) {
    if (token.type !== "inline") { continue; }

    let content = token.content.slice();

    // Check whether the inline token contains a chapter annotation.
    const chapterMatch = CHAPTER_REGEX.exec(content);
    if (chapterMatch !== null) {
      const chapterNum = chapterMatch[1];
      if (chapterNum.length !== 0) {
        fragments[chapterNum] = currentChapter = {};
      } else {
        // Something went wrong.
        currentChapter = undefined;
      }
      continue;
    }

    // If no chapter annotation was found, let's scan for verses.
    while (content.length > 0) {
      const verseMatch = VERSE_REGEX.exec(content);
      if (verseMatch === null) { break; }

      const verseNum = verseMatch[1];
      if (verseNum.length !== 0) {
        if (currentChapter) { currentChapter[verseNum] = verseMatch[2].trim(); }
      }

      // Replace content with the remained of itself.
      content = content.slice(verseMatch.index + verseMatch[0].length, content.length);
    }
  }

  return { fragments };
}

export function fetch(source: Source, ranges: Query.Range[]): string | undefined {
  let result = "";
  for (const r of ranges) {
    let { from, to } = r;

    if (from.chapter > to.chapter) { [ from, to ] = [ to, from ]; }
    if (from.chapter === to.chapter) {
      if (from.verse > to.verse) { [ from, to ] = [ to, from ]; }
    }

    for (let chapter = from.chapter; chapter <= to.chapter; ++chapter) {
      const fragment = source.fragments[chapter];
      if (!fragment) { return undefined; }
      if (_.isString(fragment)) { return undefined; }

      let fromVerse = from.verse;
      if (chapter !== from.chapter) {
        // If this is not the last chapter, run to the end of the chapter.
        const firstVerse = _.min(_(fragment).keys().map(Number).value());
        if (!firstVerse) { return undefined; }
        fromVerse = firstVerse;
      }

      let toVerse = to.verse;
      if (chapter !== to.chapter) {
        // If this is not the last chapter, run to the end of the chapter.
        const lastVerse = _.max(_(fragment).keys().map(Number).value());
        if (!lastVerse) { return undefined; }
        toVerse = lastVerse;
      }

      for (let v = fromVerse; v <= toVerse; ++v) {
        const verse = fragment[v];
        if (_.isString(verse)) {
          result += `${v} ${fragment[v]} `;
        } else {
          return undefined;
        }
      }
    }
  }

  return result.trim();
}