import * as _ from "lodash";
import * as minimatch from "minimatch";
import * as path from "path";
import * as vscode from "vscode";
import * as Config from "./Config";

export function isExtensionSourceConfig({ extension, include }: Config.SourceConfig): boolean {
  return (!_.isNil(extension) && !_.isNil(include));
}

export function isWorkspaceSourceConfig({ extension, include }: Config.SourceConfig): boolean {
  return (_.isNil(extension) && !_.isNil(include));
}

export function sourceConfigToGlobPattern({ extension, include }: Config.SourceConfig): string | undefined {
  let pattern = include;
  if (extension) {
    const vscodeExtension = vscode.extensions.getExtension(extension);
    if (vscodeExtension) {
      pattern = vscodeExtension.extensionPath + "/data/" + include + "/*.md";
    } else {
      return;
    }
  }
  return pattern;
}

export function keysForSourceFile(fsPath: string): string[] {
  // `asRelativePath` returns the absolute path if `fsPath` is not in the
  // workspace folder (i.e. if we're dealing with extensions).
  const relFsPath = vscode.workspace.asRelativePath(fsPath);

  let keys: string[] = [ ];
  const { sources } = Config.get();
  for (const source of sources) {
    const { ref } = source;
    if (!ref) { continue; }

    let pattern = sourceConfigToGlobPattern(source);
    if (!pattern) { continue; }
    if (!minimatch(relFsPath, pattern)) { continue; }

    const filename = path.basename(relFsPath, path.extname(relFsPath));
    keys.push(ref.replace("${filename}", filename));
  }
  return keys;
}

export function isSourceFile(fsPath: string): boolean {
  return keysForSourceFile(fsPath).length > 0;
}