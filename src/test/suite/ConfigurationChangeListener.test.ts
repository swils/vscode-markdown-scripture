import { expect } from "chai";
import * as _ from "lodash";
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as ConfigurationChangeListener from "../../ConfigurationChangeListener";
import { WorkspaceCache } from "../../WorkspaceCache";

describe("ConfigurationChangeListener", function() {
  describe(".handle", function() {
    it("resets the cache when the `sources` setting changes", function() {
      const affectsConfiguration = sinon.fake((s: string) => (s === "markdownScripture.sources"));
      const e: vscode.ConfigurationChangeEvent = { affectsConfiguration };
      const reset = sinon.stub(WorkspaceCache, "reset");

      ConfigurationChangeListener.handle(e);

      expect(affectsConfiguration).to.have.been.calledOnce;
      expect(reset).to.have.been.calledOnce;
    });
  });
});