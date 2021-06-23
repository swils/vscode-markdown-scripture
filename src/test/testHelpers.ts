import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as Config from "../Config";

export async function activateExtension(): Promise<void> {
  const extension = vscode.extensions.getExtension("stefanwils.markdown-scripture");
  if (!extension) {
    assert.fail("Could not find the extension...");
   }
  if (!extension.isActive) {
      await extension.activate();
  }
}

export function unstubConfig() {
  (Config.get as any).restore();
}

export function stubConfig(config?: Config.Config) {
  const CONFIG: Config.Config = config || {
    sources: [
      { include: "sources/can1939/*.md", ref: "can1939/${filename}" },
      { include: "sources/can1939/*.md", ref: "${filename}" },
    ]
  };
  return sinon.stub(Config, "get").returns(CONFIG);
}