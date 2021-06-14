import * as MarkdownIt from "markdown-it";
import * as vscode from "vscode";
import * as MarkdownItRef from "./MarkdownItRef";
import * as ResetCacheCommand from "./ResetCacheCommand";
import { ScriptureReferenceProvider } from "./ScriptureReferenceProvider";
import { WorkspaceCache } from "./WorkspaceCache";

const DOCUMENT_SELECTOR: ReadonlyArray<vscode.DocumentFilter> = [
  { language: "markdown" },
];

// This method is called when your extension is activated. Your extension is
// activated the very first time the command is executed.
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors
  // (console.error). This line of code will only be executed once when your
  // extension is activated.
  console.debug("Extension 'markdown-scripture' is now active.");

  // Load the cache of source files from previous sessions.
  WorkspaceCache.initialize(context.workspaceState);
  // Go through all the entries and update where needed.
  WorkspaceCache.updateAllUris();

  context.subscriptions.push(
    vscode.commands.registerCommand("markdown-scripture.resetCache", ResetCacheCommand.run),
    // vscode.languages.registerReferenceProvider(DOCUMENT_SELECTOR, new ScriptureReferenceProvider()),
    vscode.workspace.onDidSaveTextDocument(WorkspaceCache.onDidSaveTextDocument)
  );

  // See: https://code.visualstudio.com/api/extension-guides/markdown-extension
  return {
    extendMarkdownIt(md: MarkdownIt) {
      return md.use(MarkdownItRef.plugin);
    }
  };
}

// This method is called when your extension is deactivated.
export function deactivate() {
  console.debug("Extension 'markdown-scripture' has now been deactived.");
}