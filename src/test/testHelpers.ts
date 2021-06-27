import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as Config from "../Config";
import * as Query from "../Query";

export function range({ fc, fv, tc, tv }: any = {}): Query.Range {
  return {
    from: { chapter: fc || 1, verse: fv || 1 },
    to: { chapter: tc || fc || 1, verse: tv || fv || 1 },
  };
}

export function query({ b, ...rng }: any = {}): Query.Query {
  return {
    book: b || "jn",
    ranges: [ range(rng) ]
  };
}

export function delay(ms: number) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export function randomFileName(l = 8) {
  const rand = Math.random().toString(36).substr(2, l);
  return `__random_${rand}`;
}

export function testFilePath(testPath: string) {
  const { workspaceFolders } = vscode.workspace;
  if (!workspaceFolders) { throw new Error("Unable to create file"); }
  return path.join(workspaceFolders[0].uri.fsPath, testPath);
}

export async function tryDeleteTestDocument(path: string) {
  const testPath = testFilePath(path);
  try {
    await vscode.workspace.fs.delete(vscode.Uri.parse(testPath), { useTrash: false });
  }
  catch(err) { }
}

export async function writeTestDocument(path: string, contents: string) {
  const uri = vscode.Uri.parse(testFilePath(path));
  await vscode.workspace.fs.writeFile(uri, Buffer.from(contents));
}

export async function appendTestDocument(path: string, contents: string) {
  const doc = await vscode.workspace.openTextDocument(testFilePath(path));
  const editor = await vscode.window.showTextDocument(doc);
  editor.edit((builder) => {
    builder.insert(new vscode.Position(Number.MAX_VALUE, Number.MAX_VALUE), contents);
  });
  await doc.save();
}

export async function readTestDocument(path: string) {
  const doc = await vscode.workspace.openTextDocument(testFilePath(path));
  return doc.getText();
}

export async function closeAllEditors() {
  await vscode.commands.executeCommand("workbench.action.closeAllEditors");
}

export function getExtension() {
  return vscode.extensions.getExtension("swils.markdown-scripture");
}

export async function activateExtension(): Promise<void> {
  const extension = getExtension();
  if (!extension) {
    assert.fail("Could not find the extension...");
   }
  if (!extension.isActive) {
    await extension.activate();
  }
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

export function unstubConfig() {
  (Config.get as any).restore();
}