import * as assert from "assert";
import * as vscode from "vscode";

// import * as myExtension from "../../extension";

describe("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  it("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});