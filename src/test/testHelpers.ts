import * as assert from "assert";
import * as vscode from "vscode";

export async function activateExtension(): Promise<void> {
  const extension = vscode.extensions.getExtension("stefanwils.markdown-scripture");
  if (!extension) {
    assert.fail("Could not find the extension...");
   }
  if (!extension.isActive) {
      await extension.activate();
  }
}