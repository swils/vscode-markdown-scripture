import * as vscode from "vscode";
import * as ResetCacheCommand from "./ResetCacheCommand";

export function handle(e: vscode.ConfigurationChangeEvent) {
  if (e.affectsConfiguration("markdownScripture.sources")) {
    ResetCacheCommand.run();
  }
}