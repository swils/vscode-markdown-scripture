import { expect } from "chai";
import * as MarkdownIt from "markdown-it";
import * as sinon from "sinon";
import * as MarkdownItRef from "../../MarkdownItRef";
import * as Query from "../../Query";
import { WorkspaceCache } from "../../WorkspaceCache";
import _ = require("lodash");

interface TestCase {
  title?: string;
  markdown: string;
  fetch: { [key:string]: string };
  rendered: string;
}

describe("MarkdownItRef", function() {
  describe("plugin", function() {
    let parser: MarkdownIt;

    beforeEach(function() {
      parser = new MarkdownIt();
      parser.use(MarkdownItRef.plugin);
    });

    const cases: TestCase[] = [
      {
        markdown: "pre ?[foo#4:6] post",
        fetch: {"foo#4:6": "included text"},
        rendered: "<p>pre Foo 4:6 post</p>\n",
      }, {
        markdown: "pre ![foo#4:6] post",
        fetch: {"foo#4:6": "included text"},
        rendered: "<p>pre included text post</p>\n",
      }, {
        title: "deals with multiple references",
        markdown: "a ![foo#4:6] c ![bar#5:9] e ?[baz#1:2] g",
        fetch: {"foo#4:6": "b", "bar#5:9": "d", "baz#1:2": "f"},
        rendered: "<p>a b c d e Baz 1:2 g</p>\n",
      }, {
        title: "renders non-matching query reference with <mark>",
        markdown: "pre ?[foo#4:7] post",
        fetch: {"foo#4:6": "included text"},
        rendered: "<p>pre &lt;mark&gt;?[foo#4:7]&lt;/mark&gt; post</p>\n",
      }, {
        title: "renders non-matching inclusion reference with <mark>",
        markdown: "pre ![foo#4:7] post",
        fetch: {"foo#4:6": "included text"},
        rendered: "<p>pre &lt;mark&gt;![foo#4:7]&lt;/mark&gt; post</p>\n",
      }, {
        title: "handles books with path prefixes",
        markdown: "pre ![books/foo#4:6] post",
        fetch: {"books/foo#4:6": "correct", "foo#4:6": "wrong"},
        rendered: "<p>pre correct post</p>\n",
      },
    ];
    cases.forEach(function({ title, markdown, fetch, rendered }) {
      it(title || `renders "${markdown}"`, function() {
        sinon.stub(WorkspaceCache, "fetch").callsFake(({ book, ranges }) =>
          fetch[`${book}#${Query.rangesToString(ranges)}`]
        );
        expect(parser.render(markdown)).to.equal(rendered);
      });
    });
  });
});