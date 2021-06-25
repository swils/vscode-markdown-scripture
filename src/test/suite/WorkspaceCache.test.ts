import { expect } from "chai";
import * as sinon from "sinon";
import { WorkspaceCache } from "../../WorkspaceCache";
import {
  activateExtension,
  appendTestDocument,
  delay,
  query,
  randomFileName,
  tryDeleteTestDocument,
  writeTestDocument
} from "../testHelpers";

describe("WorkspaceCache", function() {
  // We approach this as a set of integration tests. We also cannot fully leave
  // private implementation details unexposed (we need to spy on private methods
  // in a number of tests), due to the way the extension is activated during
  // tests.

  beforeEach(async function() {
    await activateExtension();
  });

  describe(".fetch", async function() {
    it("returns parsed verses", async function() {
      const verses = WorkspaceCache.fetch(query({ b: "jn", fc: 3, fv: 16 }));
      expect(verses).to.contain("For God so loved the world, as to give his only begotten Son");
    });
  });

  describe(".updateAllUris", async function() {
    it("picks up new files, updates edited files and prunes deleted files", async function() {
      const b = randomFileName();
      const testPath = `sources/dr1899/${b}.md`;
      const testRef1 = query({ b, fc: 1, fv: 1 });
      const testRef3 = query({ b, fc: 1, fv: 3 });

      try {
        expect(WorkspaceCache.fetch(testRef1)).to.be.undefined;

        // We create the test file directly on the filesystem.
        await writeTestDocument(testPath, "<!-- scripture:1 -->\n\n[1] test1 [2] test2\n");
        await WorkspaceCache.updateAllUris();
        expect(WorkspaceCache.fetch(testRef1)).to.equal("1 test1");
        expect(WorkspaceCache.fetch(testRef3)).to.be.undefined;

        // This short artificial delay should make the timestamp comparison for
        // the cache update recognize the update with certainty. We can't use
        // sinon clocks for this, because the update really goes through the OS.
        await delay(100);

        // Since the document has been parsed before as a `vscode.TextDocument`,
        // we need to perform the file update using VSCode's editing facilities.
        // Otherwise the change will not be visible upon re-parsing.
        await appendTestDocument(testPath, "[3] test3\n");
        await WorkspaceCache.updateAllUris();
        expect(WorkspaceCache.fetch(testRef1)).to.equal("1 test1");
        expect(WorkspaceCache.fetch(testRef3)).to.equal("3 test3");

        await tryDeleteTestDocument(testPath);
        await WorkspaceCache.updateAllUris();
        expect(WorkspaceCache.fetch(testRef1)).to.be.undefined;
      } finally {
        await tryDeleteTestDocument(testPath);
      }
    });

    it("persists the updated cache", async function() {
      const persistSpy = sinon.spy(WorkspaceCache as any, "persist");
      await WorkspaceCache.updateAllUris();
      expect(persistSpy).to.have.been.called;
    });
  });

  describe(".onDidSaveTextDocument", async function() {
    it("responds to registered source file changes", async function() {
      const testPath = `sources/dr1899/${randomFileName()}.md`;
      try {
        await writeTestDocument(testPath, "");

        const updateSpy = sinon.stub((WorkspaceCache as any), "update");
        const persistSpy = sinon.stub((WorkspaceCache as any), "persist");

        await appendTestDocument(testPath, "something\n");

        expect(updateSpy).to.have.been.calledOnce;
        expect(persistSpy).to.have.been.calledOnce;
      } finally {
        await tryDeleteTestDocument(testPath);
      }
    });

    it("ignores other files", async function() {
      const testPath = `${randomFileName()}.md`;
      try {
        await writeTestDocument(testPath, "");

        const updateSpy = sinon.stub((WorkspaceCache as any), "update");
        const persistSpy = sinon.stub((WorkspaceCache as any), "persist");

        await appendTestDocument(testPath, "something\n");

        expect(updateSpy).not.to.have.been.calledOnce;
        expect(persistSpy).not.to.have.been.calledOnce;
      } finally {
        await tryDeleteTestDocument(testPath);
      }
    });
  });
});