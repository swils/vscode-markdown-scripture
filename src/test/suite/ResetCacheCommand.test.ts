import { expect } from "chai";
import * as _ from "lodash";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { activateExtension } from "../testHelpers";
import { WorkspaceCache } from "../../WorkspaceCache";

describe("ResetCacheCommand", function() {
  it("resets the cache", async function() {
    await activateExtension();

    const reset = sinon.stub(WorkspaceCache, "reset");
    const showInformationMessage = sinon.stub(vscode.window, "showInformationMessage");

    await vscode.commands.executeCommand("markdownScripture.resetCache");

    expect(reset).to.have.been.calledOnce;
    expect(showInformationMessage).to.have.been.calledOnce;
  });
});