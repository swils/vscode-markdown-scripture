import { expect } from "chai";
import * as _ from "lodash";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { stubConfig } from "../testHelpers";
import { SourceMap } from "../../SourceMap";

describe("SourceMap", function() {
  const OBJECT = { x: 1 };

  let map: SourceMap<object>;

  beforeEach(function() {
    map = new SourceMap<object>();
    map.add("sources/dr1899/jn.md", OBJECT);
  });

  describe("#byKey", function() {
    it("returns `undefined` when it has not been added", function() {
      expect(map.byKey("mc")).to.be.undefined;
    });

    it("returns the object when it has been added (supporting multiple keys)", function() {
      expect(map.byKey("jn")).to.deep.equal(OBJECT);
      expect(map.byKey("dr1899/jn")).to.deep.equal(OBJECT);
    });
  });

  describe("#byPath", function() {
    it("returns `undefined` when the object has not been added", function() {
      expect(map.byPath("sources/dr1899/mc.md")).to.be.undefined;
    });

    it("returns the object when the object has been added", function() {
      expect(map.byPath("sources/dr1899/jn.md")).to.deep.equal(OBJECT);
    });
  });

  describe("#add", function() {
    it("throws when adding the same object twice", function() {
      expect(() => map.add("sources/dr1899/jn.md", { y: 2 })).to.throw();
    });

    it("does nothing when no key can be found for the object", function () {
      expect(() => map.add("sources/wb1981/jn.md", { y: 2 })).not.to.throw();
      expect(map.byPath("sources/wb1981/jn.md")).to.be.undefined;
    });

    it("throws when adding something would lead to duplicate keys", function () {
      stubConfig({
        sources: [
          { include: "sources/duplicate/*.md", ref: "${filename}" },
          { include: "sources/dr1899/*.md", ref: "${filename}" },
        ]
      });
      map = new SourceMap<object>();
      map.add("sources/dr1899/jn.md", OBJECT);
      expect(() => map.add("sources/duplicate/jn.md", OBJECT)).to.throw();
    });

    it("adds the object with the proper keys", function () {
      map.add("sources/dr1899/lc.md", { y: 2 });
      expect(map.byKey("lc")).to.deep.equal({ y: 2 });
      expect(map.byKey("dr1899/lc")).to.deep.equal({ y: 2 });
    });
  });

  describe("#update", function() {
    it("throws when updating an object which has not been added", function() {
      expect(() => map.update("sources/dr1899/lc.md", { y: 2 })).to.throw();
    });

    it("updates an existing object", function () {
      map.update("sources/dr1899/jn.md", { y: 2 });
      expect(map.byKey("jn")).to.deep.equal({ y: 2 });
      expect(map.byKey("dr1899/jn")).to.deep.equal({ y: 2 });
    });
  });

  describe("#remove", function() {
    it("removes the object and all its keys but nothing else", function () {
      map.add("sources/dr1899/lc.md", { y: 2 });

      expect(map.byKey("jn")).not.to.be.undefined;
      expect(map.byKey("dr1899/jn")).not.to.be.undefined;
      expect(map.byKey("lc")).not.to.be.undefined;
      expect(map.byKey("dr1899/lc")).not.to.be.undefined;

      map.remove("sources/dr1899/lc.md");

      expect(map.byKey("jn")).not.to.be.undefined;
      expect(map.byKey("dr1899/jn")).not.to.be.undefined;
      expect(map.byKey("lc")).to.be.undefined;
      expect(map.byKey("dr1899/lc")).to.be.undefined;
    });

    it("does nothing when removing an object which is not present", function () {
      expect(map.byKey("dr1899/lc")).to.be.undefined;

      map.remove("sources/dr1899/lc.md");

      expect(map.byKey("dr1899/lc")).to.be.undefined;
    });
  });

  describe("#prune", function () {
    it("removes all existing objects with paths which are not in the new set of paths", function() {
      map.add("sources/dr1899/lc.md", { y: 2 });

      expect(map.byKey("jn")).not.to.be.undefined;
      expect(map.byKey("dr1899/jn")).not.to.be.undefined;
      expect(map.byKey("lc")).not.to.be.undefined;
      expect(map.byKey("dr1899/lc")).not.to.be.undefined;

      map.prune([ "sources/dr1899/jn.md" ]);

      expect(map.byKey("jn")).not.to.be.undefined;
      expect(map.byKey("dr1899/jn")).not.to.be.undefined;
      expect(map.byKey("lc")).to.be.undefined;
      expect(map.byKey("dr1899/lc")).to.be.undefined;
    });
  });

  describe("#fromJson and #toJson", function() {
    it("supports storage as JSON objects", function() {
      const obj = map.toJson();
      const newMap = SourceMap.fromJson(obj);
      expect(newMap.byKey("jn")).to.deep.equal(OBJECT);
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