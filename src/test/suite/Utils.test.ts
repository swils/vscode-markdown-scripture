import { expect } from "chai";
import * as _ from "lodash";
import * as sinon from "sinon";
import { assert } from "sinon";
import * as vscode from "vscode";
import { createFsPathForExtensionSource, stubConfig } from "../testHelpers";
import * as Utils from "../../Utils";
import { create } from "lodash";

describe("Utils", function() {
  beforeEach(function() {
    stubConfig();
  });

  describe("#isExtensionSourceConfig", function() {
    it("returns true for extension sources", () => {
      expect(Utils.isExtensionSourceConfig({ extension: "swils.markdown-scripture", include: "test" })).to.be.true;
    });

    it("returns false if no extension is specified", () => {
      expect(Utils.isExtensionSourceConfig({ extension: "swils.markdown-scripture" })).to.be.false;
    });

    it("returns false if no include part is specified", () => {
      expect(Utils.isExtensionSourceConfig({ include: "test" })).to.be.false;
    });
  });

  describe("#isWorkspaceSourceConfig", function() {
    it("returns true for workspace sources", () => {
      expect(Utils.isWorkspaceSourceConfig({ include: "sources/can1939/*.md" })).to.be.true;
    });

    it("returns false if an extension is specified", () => {
      expect(Utils.isWorkspaceSourceConfig({ extension: "swils.markdown-scripture", include: "test" })).to.be.false;
    });

    it("returns false if no include part is specified", () => {
      expect(Utils.isWorkspaceSourceConfig({ extension: "swils.markdown-scripture" })).to.be.false;
    });
  });

  describe("#sourceConfigToGlobPattern", () => {
    it("returns a string for a valid extension source", () => {
      expect(Utils.sourceConfigToGlobPattern({ extension: "swils.markdown-scripture", include: "test" })).to.match(/data\/test\/\*\.md$/);
    });

    it("returns undefined for an invalid extension source", () => {
      expect(Utils.sourceConfigToGlobPattern({ extension: "nonexisting", include: "test" })).to.be.undefined;
    });

    it("returns the original include part for a workspace source", () => {
      expect(Utils.sourceConfigToGlobPattern({ include: "sources/can1939/*.md" })).to.equal("sources/can1939/*.md");
    });
  });

  describe("#keysForSourceFile", function() {
    describe("with multiple `sources` entries in the configuration", function() {
      it("returns multiple keys for matches", function() {
        const extensionKeys = Utils.keysForSourceFile(createFsPathForExtensionSource("test/john.md"));
        expect(extensionKeys).to.have.length(1);
        expect(extensionKeys).to.contain("test/john");

        const workspaceKeys = Utils.keysForSourceFile("sources/can1939/john.md");
        expect(workspaceKeys).to.have.length(2);
        expect(workspaceKeys).to.contain("can1939/john");
        expect(workspaceKeys).to.contain("john");
      });

      it("returns no keys for files that do not match", function() {
        const extensionKeys = Utils.keysForSourceFile(createFsPathForExtensionSource("nonexisting/john.md"));
        expect(extensionKeys).to.be.empty;

        const workspaceKeys = Utils.keysForSourceFile("sources/dr1899/john.md");
        expect(workspaceKeys).to.be.empty;
      });
    });
  });

  describe("#isSourceFile", function() {
    describe("with multiple `sources` entries in the configuration", function() {
      it("returns true for matches", function() {
        const extensionResult = Utils.isSourceFile(createFsPathForExtensionSource("test/john.md"));
        expect(extensionResult).to.be.true;

        const workspaceResult = Utils.isSourceFile("sources/can1939/john.md");
        expect(workspaceResult).to.be.true;
      });

      it("returns false for non-matches", function() {
        const extensionResult = Utils.isSourceFile(createFsPathForExtensionSource("nonexisting/john.md"));
        expect(extensionResult).to.be.false;

        const workspaceResult = Utils.isSourceFile("sources/dr1899/john.md");
        expect(workspaceResult).to.be.false;
      });
    });
  });
});