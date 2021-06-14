import * as vscode from "vscode";
import { WorkspaceCache } from "./WorkspaceCache";

export async function run() {
  await WorkspaceCache.reset();
  vscode.window.showInformationMessage("Cache for Markdown Scripture sources has been reset.");
}