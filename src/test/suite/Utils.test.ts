import { expect } from "chai";
import * as _ from "lodash";
import * as sinon from "sinon";
import { assert } from "sinon";
import * as vscode from "vscode";
import { stubConfig } from "../testHelpers";
import * as Utils from "../../Utils";

describe("Utils", function() {
  beforeEach(function() {
    stubConfig();
  });

  describe("#keysForSourceFile", function() {
    describe("with multiple `sources` entries in the configuration", function() {
      it("returns multiple keys for matches", function() {
        const keys = Utils.keysForSourceFile("sources/can1939/jn.md");
        expect(keys).to.have.length(2);
        expect(keys).to.contain("jn");
        expect(keys).to.contain("can1939/jn");
      });

      it("returns no keys for files that do not match", function() {
        const keys = Utils.keysForSourceFile("sources/dr1899/jn.md");
        expect(keys).to.be.empty;
      });
    });
  });

  describe("#isSourceFile", function() {
    describe("with multiple `sources` entries in the configuration", function() {
      it("returns true for matches", function() {
        const result = Utils.isSourceFile("sources/can1939/jn.md");
        expect(result).to.be.true;
      });

      it("returns false for non-matches", function() {
        const result = Utils.isSourceFile("sources/dr1899/jn.md");
        expect(result).to.be.false;
      });
    });
  });
});