export interface Verse {
  chapter: number;
  verse: number;
}

function parseVerse(chapter: number | undefined, v: string): Verse | undefined {
  let colonPos = v.search(":");
  if (colonPos !== -1) {
    chapter = +v.slice(0, colonPos);
     v = v.slice(colonPos + 1);
  }
  const verse = +v;
  return chapter ? { chapter, verse } : undefined;
}

export interface Range {
  from: Verse;
  to: Verse;
}

function parseRange(chapter: number | undefined, r: string): Range | undefined {
  let dashPos = r.search("-");
  if (dashPos !== -1) {
    const from = parseVerse(chapter, r.slice(0, dashPos));
    if (!from) { return; }
    const to = parseVerse(from.chapter, r.slice(dashPos + 1));
    if (!to) { return; }
    return { from, to };
  } else {
    const from = parseVerse(chapter, r);
    if (!from) { return; }
    const to = from;
    return { from, to };
  }
}

export interface Query {
  book: string;
  ranges: Range[];
}

export function parse(q: string): Query | undefined {
  const trimmed = q.trim();

  // Only retain what's between leading and ending brackets.
  const noBrackets = /^\[(.*)\]$/.exec(trimmed);
  if (!noBrackets) { return; }

  // Filter out all internal space.
  const noSpace = noBrackets[1].replace(/\s/, "");

  // Split in book and verse ranges.
  const splitInBookAndRanges = noSpace.split("#");
  if (splitInBookAndRanges.length !== 2) { return; }

  // Extract book.
  const book = splitInBookAndRanges[0].trim();
  if (book.length === 0) { return; }

  // 3:5,3-4,3-6,4:5-4.
  let currentChapter: number | undefined;
  const rawRanges = splitInBookAndRanges[1].split(",");
  if (!rawRanges) { return; }

  let ranges: Range[] = [ ];
  for (const rawRange of rawRanges) {
    const range = parseRange(currentChapter, rawRange);
    if (!range) { return; }
    currentChapter = range.to.chapter;
    ranges.push(range);
  }

  // At the very least we need to start with a range...
  if (ranges.length === 0) { return; }
  // And the first range needs a chapter.
  if (!ranges[0].from.chapter) { return; }
  // Otherwise, it's up to the client to decide whether the parsed ranges make
  // sense in light of the book in question.
  return { book, ranges };
}

function bookToString(book: string): string | undefined {
  const split = book.split("/");
  if (split.length === 0) { return; }

  const last = split[split.length - 1];
  return last[0].toUpperCase() + last.slice(1).toLowerCase();
}

export function rangesToString(ranges: Range[]): string | undefined {
  if (ranges.length === 0) { return; }
  let lastChapter: number = NaN;
  const result = ranges.map(({ to, from }) => {
    let rangeResult = "";

    // Add optional `from chapter`.
    if (from.chapter !== lastChapter) {
      lastChapter = from.chapter;
      rangeResult += `${lastChapter.toString()}:`;
    }

    // Add `from verse`.
    rangeResult += from.verse.toString();

    // An actual range or a single verse?
    if ((from.chapter === to.chapter) && (from.verse === to.verse)) {
      return rangeResult;
    } else {
      rangeResult += "-";
    }

    // Add optional `to chapter`.
    if (to.chapter !== lastChapter) {
      lastChapter = to.chapter;
      rangeResult += `${lastChapter.toString()}:`;
    }

    // Add `to verse`.
    rangeResult += to.verse.toString();

    return rangeResult;
  });

  return result.join(",");
}

export function toString({ book, ranges }: Query): string {
  return `${bookToString(book)} ${rangesToString(ranges)}`;
}