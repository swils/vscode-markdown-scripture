import { expect } from "chai";
import { WorkspaceCache } from "../../WorkspaceCache";
import { activateExtension } from "../testHelpers";

describe("extension", function() {
  describe("activation", function() {
    before(async function () {
      await activateExtension();
    });

    it("initialized the cache", function() {
      expect(WorkspaceCache.isInitialized()).to.be.true;
    });
  });
});