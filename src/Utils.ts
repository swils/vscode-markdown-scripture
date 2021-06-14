import * as minimatch from "minimatch";
import * as path from "path";
import * as vscode from "vscode";
import * as Config from "./Config";

export function keysForSourceFile(fsPath: string): string[] {
  const relFsPath = vscode.workspace.asRelativePath(fsPath);
  let keys: string[] = [ ];
  const { sources } = Config.get();
  for (const { include, ref } of sources) {
    if (!include || !ref) { continue; }
    if (!minimatch(relFsPath, include)) { continue; }
    const filename = path.basename(relFsPath, path.extname(relFsPath));
    keys.push(ref.replace("${filename}", filename));
  }
  return keys;
}

export function isSourceFile(fsPath: string): boolean {
  return keysForSourceFile(fsPath).length > 0;
}