import * as vscode from "vscode";

function rangeToString(range: vscode.Range): string {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
}

export class ScriptureReferenceProvider implements vscode.ReferenceProvider {
  /**
   * Provide a set of project-wide references for the given position and document.
   *
   * @param document The document in which the command was invoked.
   * @param position The position at which the command was invoked.
   * @param token A cancellation token.
   *
   * @return An array of locations or a thenable that resolves to such. The lack of a result can be
   * signaled by returning `undefined`, `null`, or an empty array.
   */
  provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Location[]> {
    const range = ScriptureReferenceProvider.parseReference(document, position);
    if (range) {
      vscode.window.showInformationMessage(`Found a reference (${rangeToString(range)})!`);
    }
    return undefined;
  }

  static parseReference(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
    const range = document.getWordRangeAtPosition(position, /scripture/);
    if (!range) { return; }
    return range;
  }
}