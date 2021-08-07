import { expect } from "chai";
import * as _ from "lodash";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { createFsPathForExtensionSource, stubConfig } from "../testHelpers";
import { SourceMap } from "../../SourceMap";
import { create } from "lodash";

describe("SourceMap", function() {
  const EXTENSION_OBJECT = { y: 2 };
  const WORKSPACE_OBJECT = { x: 1 };

  let map: SourceMap<object>;

  beforeEach(function() {
    map = new SourceMap<object>();
    map.add(createFsPathForExtensionSource("test/john.md"), EXTENSION_OBJECT);
    map.add("sources/can1939/john.md", WORKSPACE_OBJECT);
  });

  describe("#byKey", function() {
    it("returns `undefined` when it has not been added", function() {
      expect(map.byKey("mark")).to.be.undefined;
      expect(map.byKey("test/mark")).to.be.undefined;
    });

    it("returns the object when it has been added", function() {
      // For the extension object (by both keys).
      expect(map.byKey("test/john")).to.deep.equal(EXTENSION_OBJECT);
      expect(map.byKey("john")).to.deep.equal(EXTENSION_OBJECT);

      // For the workspace object.
      expect(map.byKey("can1939/john")).to.deep.equal(WORKSPACE_OBJECT);
    });
  });

  describe("#byPath", function() {
    it("returns `undefined` when the object has not been added", function() {
      expect(map.byPath(createFsPathForExtensionSource("test/mark.md"))).to.be.undefined;
      expect(map.byPath("sources/can1939/mark.md")).to.be.undefined;
    });

    it("returns the object when the object has been added", function() {
      expect(map.byPath(createFsPathForExtensionSource("test/john.md"))).to.deep.equal(EXTENSION_OBJECT);
      expect(map.byPath("sources/can1939/john.md")).to.deep.equal(WORKSPACE_OBJECT);
    });
  });

  describe("#add", function() {
    it("throws when adding the same object twice", function() {
      expect(() => map.add(createFsPathForExtensionSource("test/john.md"), { y: 2 })).to.throw();
      expect(() => map.add("sources/can1939/john.md", { y: 2 })).to.throw();
    });

    it("does nothing when no key can be found for the object", function () {
      const extensionPath = createFsPathForExtensionSource("nonexisting/john.md");
      expect(() => map.add(extensionPath, { y: 2 })).not.to.throw();
      expect(map.byPath(extensionPath)).to.be.undefined;

      const workspacePath = "sources/wb1981/john.md";
      expect(() => map.add(workspacePath, { y: 2 })).not.to.throw();
      expect(map.byPath(workspacePath)).to.be.undefined;
    });

    it("throws when adding something would lead to duplicate keys", function () {
      stubConfig({
        sources: [
          { extension: "swils.markdown-scripture", include: "test", ref: "${filename}" },
          { include: "sources/duplicate/*.md", ref: "${filename}" },
          { include: "sources/can1939/*.md", ref: "${filename}" },
        ]
      });
      map = new SourceMap<object>();
      map.add("sources/can1939/john.md", WORKSPACE_OBJECT);
      expect(() => map.add(createFsPathForExtensionSource("test/john.md"), EXTENSION_OBJECT)).to.throw();
      expect(() => map.add("sources/duplicate/john.md", WORKSPACE_OBJECT)).to.throw();
    });

    it("adds the object with the proper keys", function () {
      map.add(createFsPathForExtensionSource("test/luke.md"), { z: 3 });
      expect(map.byKey("luke")).to.deep.equal({ z: 3 });
      expect(map.byKey("test/luke")).to.deep.equal({ z: 3 });

      map.add("sources/can1939/luke.md", { z: 3 });
      expect(map.byKey("can1939/luke")).to.deep.equal({ z: 3 });
    });
  });

  describe("#update", function() {
    it("throws when updating an object which has not been added", function() {
      expect(() => map.update(createFsPathForExtensionSource("test/luke.md"), { y: 2 })).to.throw();
      expect(() => map.update("sources/can1939/luke.md", { y: 2 })).to.throw();
    });

    it("updates an existing object", function () {
      map.update(createFsPathForExtensionSource("test/john.md"), { z: 3 });
      expect(map.byKey("john")).to.deep.equal({ z: 3 });
      expect(map.byKey("test/john")).to.deep.equal({ z: 3 });

      map.update("sources/can1939/john.md", { z: 3 });
      expect(map.byKey("can1939/john")).to.deep.equal({ z: 3 });
    });
  });

  describe("#remove", function() {
    it("removes the object and all its keys but nothing else", function () {
      map.add(createFsPathForExtensionSource("test/matt.md"), { y: 2 });
      map.add("sources/can1939/luke.md", { y: 2 });

      expect(map.byKey("test/john")).not.to.be.undefined;
      expect(map.byKey("test/matt")).not.to.be.undefined;
      expect(map.byKey("john")).not.to.be.undefined;
      expect(map.byKey("matt")).not.to.be.undefined;
      expect(map.byKey("can1939/john")).not.to.be.undefined;
      expect(map.byKey("can1939/luke")).not.to.be.undefined;

      map.remove(createFsPathForExtensionSource("test/matt.md"));
      map.remove("sources/can1939/luke.md");

      expect(map.byKey("test/john")).not.to.be.undefined;
      expect(map.byKey("test/matt")).to.be.undefined;
      expect(map.byKey("john")).not.to.be.undefined;
      expect(map.byKey("matt")).to.be.undefined;
      expect(map.byKey("can1939/john")).not.to.be.undefined;
      expect(map.byKey("can1939/luke")).to.be.undefined;
    });

    it("does nothing when removing an object which is not present", function () {
      expect(map.byKey("test/luke")).to.be.undefined;
      expect(map.byKey("can1939/luke")).to.be.undefined;

      map.remove(createFsPathForExtensionSource("test/luke.md"));
      map.remove("sources/can1939/luke.md");

      expect(map.byKey("test/luke")).to.be.undefined;
      expect(map.byKey("can1939/luke")).to.be.undefined;
    });
  });

  describe("#prune", function () {
    it("removes all existing objects with paths which are not in the new set of paths", function() {
      map.add(createFsPathForExtensionSource("test/matt.md"), { y: 2 });
      map.add("sources/can1939/luke.md", { y: 2 });

      expect(map.byKey("test/john")).not.to.be.undefined;
      expect(map.byKey("test/matt")).not.to.be.undefined;
      expect(map.byKey("john")).not.to.be.undefined;
      expect(map.byKey("matt")).not.to.be.undefined;
      expect(map.byKey("can1939/john")).not.to.be.undefined;
      expect(map.byKey("can1939/luke")).not.to.be.undefined;

      map.prune([
        createFsPathForExtensionSource("test/john.md"),
        "sources/can1939/john.md"
      ]);

      expect(map.byKey("test/john")).not.to.be.undefined;
      expect(map.byKey("test/matt")).to.be.undefined;
      expect(map.byKey("john")).not.to.be.undefined;
      expect(map.byKey("matt")).to.be.undefined;
      expect(map.byKey("can1939/john")).not.to.be.undefined;
      expect(map.byKey("can1939/luke")).to.be.undefined;
    });
  });

  describe("#fromJson and #toJson", function() {
    it("supports storage as JSON objects", function() {
      const obj = map.toJson();
      const newMap = SourceMap.fromJson(obj);
      expect(newMap.byKey("john")).to.deep.equal(EXTENSION_OBJECT);
      expect(newMap.byKey("test/john")).to.deep.equal(EXTENSION_OBJECT);
      expect(newMap.byKey("can1939/john")).to.deep.equal(WORKSPACE_OBJECT);
    });
  });

  describe(".isCacheObject", function() {
    it("recognizes objects which are not SourceMapObject objects", function() {
      // Can't help but test implementation details.
      expect(SourceMap.isCacheObject({ keyToFsPathMap: 1, })).to.be.false;
      expect(SourceMap.isCacheObject({ fsPathToEntryMap: 1, })).to.be.false;
      expect(SourceMap.isCacheObject({
        keyToFsPathMap: 1,
        fsPathToEntryMap: 1,
      })).to.be.true;
      expect(SourceMap.isCacheObject({
        keyToFsPathMap: 1,
        fsPathToEntryMap: 1,
        someOtherField: 1,
      })).to.be.true;
    });
  });
});