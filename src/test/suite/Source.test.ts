import { expect } from "chai";
import * as _ from "lodash";
import * as vscode from "vscode";
import * as Source from "../../Source";

const TEST_FILE = `
# Title

## Chapter 1 <!-- scripture:1 -->

[1] a [2] b [3] c

## Chapter 2 <!-- scripture:2 -->

[1] d [2] e [3] f

## Chapter 3 <!-- scripture:3 -->

[1] g [2] h [3] i
`;

describe("Source", function() {
  let source: Source.Source;

  this.beforeEach(async function() {
    const doc = await vscode.workspace.openTextDocument({ language: "markdown", content: TEST_FILE });
    source = Source.create(doc);
  });

  describe(".create", function() {
    it("parses a document", async function() {
      expect(source.fragments).to.deep.equal({
        "1": {
          "1": "a",
          "2": "b",
          "3": "c",
        },
        "2": {
          "1": "d",
          "2": "e",
          "3": "f",
        },
        "3": {
          "1": "g",
          "2": "h",
          "3": "i",
        },
      });
    });
  });

  describe(".fetch", function() {
    it ("returns the requested text when available", async function () {
      const result = Source.fetch(source, [
        { from: { chapter: 2, verse: 1 }, to: { chapter: 2, verse: 1 } }
      ]);
      expect(result).to.equal("1 d");
    });

    it ("returns undefined when something is not available", async function () {
      const result = Source.fetch(source, [
        { from: { chapter: 2, verse: 1 }, to: { chapter: 2, verse: 1 } },
        { from: { chapter: 4, verse: 1 }, to: { chapter: 4, verse: 1 } }
      ]);
      expect(result).to.be.undefined;
    });

    it ("properly handles crossing a chapter boundary", async function () {
      // Perhaps this behavior is not what we want?
      const result = Source.fetch(source, [
        { from: { chapter: 1, verse: 2 }, to: { chapter: 2, verse: 1 } }
      ]);
      expect(result).to.equal("2 b 3 c 1 d");
    });

    it ("returns undefined when chapters are out-of-order", async function () {
      const result = Source.fetch(source, [
        { from: { chapter: 3, verse: 3 }, to: { chapter: 1, verse: 2 } }
      ]);
      expect(result).to.equal("2 b 3 c 1 d 2 e 3 f 1 g 2 h 3 i");
    });

    it ("returns undefined when verses are out-of-order", async function () {
      const result = Source.fetch(source, [
        { from: { chapter: 2, verse: 2 }, to: { chapter: 2, verse: 1 } },
      ]);
      expect(result).to.equal("1 d 2 e");
    });
  });
});