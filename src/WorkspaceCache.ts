import * as _ from "lodash";
import * as glob from "glob";
import * as vscode from "vscode";
import * as Config from "./Config";
import { Query } from "./Query";
import * as Source from "./Source";
import * as SourceMap from "./SourceMap";
import * as Utils from "./Utils";

const CACHE_NAME = "markdown-scripture-cache";

interface TimestampedSource {
  mtime: number;
  source: Source.Source;
}

class TimestampedSourceMap extends SourceMap.SourceMap<TimestampedSource> {}

export class WorkspaceCache {
  private static workspaceState: vscode.Memento | undefined;
  private static sourceMap: TimestampedSourceMap | undefined;

  static isInitialized(): boolean {
    return !_.isNil(WorkspaceCache.sourceMap);
  }

  static initialize(workspaceState: vscode.Memento) {
    WorkspaceCache.workspaceState = workspaceState;

    const cacheObject = WorkspaceCache.workspaceState.get(CACHE_NAME);
    WorkspaceCache.sourceMap =
      SourceMap.SourceMap.isCacheObject<TimestampedSource>(cacheObject) ?
      SourceMap.SourceMap.fromJson<TimestampedSource>(cacheObject) :
      new TimestampedSourceMap();
  }

  static fetch({ book, ranges }: Query): string | undefined {
    const entry = this.sourceMap?.byKey(book);
    if (!entry) { return; }
    return Source.fetch(entry.source, ranges);
  }

  static async reset() {
    WorkspaceCache.sourceMap = new SourceMap.SourceMap<TimestampedSource>();
    await WorkspaceCache.updateAllUris();
  }

  public static async updateAllUris() {
    try {
      const uris = await WorkspaceCache.allUris();
      WorkspaceCache.sourceMap?.prune(_.map(uris, "fsPath"));
      await Promise.all(uris.map((uri) => WorkspaceCache.update(uri, undefined)));
      WorkspaceCache.persist();
    } catch (e) {
      console.error(e);
    }
  }

  // Can be registered as an on-save handler. Will only trigger parsing for
  // files that are registered as source files.
  static async onDidSaveTextDocument(document: vscode.TextDocument) {
    const { uri } = document;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) { return; }
    if (Utils.isSourceFile(uri.fsPath)) {
      await WorkspaceCache.update(uri, document);
      WorkspaceCache.persist();
    }
  }

  private static async update(uri: vscode.Uri, document?: vscode.TextDocument) {
    if (!WorkspaceCache.sourceMap) { return; }
    try {
      const { fsPath } = uri;
      const { mtime } = await vscode.workspace.fs.stat(uri);

      // If it doesn't exist yet: add it.
      const entry = WorkspaceCache.sourceMap.byPath(uri.fsPath);
      if (entry) {
        if (mtime <= entry.mtime) { return; }
      }

      const source = document ?
        Source.create(document) :
        Source.create(await vscode.workspace.openTextDocument(uri));
      if (entry) {
        WorkspaceCache.sourceMap.update(fsPath, { source, mtime });
      } else {
        WorkspaceCache.sourceMap.add(fsPath, { source, mtime });
      }
    }
    catch(e) {
      // If something went wrong, remove it. Removal always succeeds.
      console.error(e);
      WorkspaceCache.sourceMap.remove(uri.fsPath);
    }
  }

  private static async allUris(): Promise<vscode.Uri[]> {
    const { sources } = Config.get();

    const uris = await Promise.all(sources.map((source) => {
      const pattern = Utils.sourceConfigToGlobPattern(source);
      if (!pattern) { return []; }

      // Deal with extensions (absolute paths, outside of the workspace).
      if (Utils.isExtensionSourceConfig(source)) {
        return new Promise<vscode.Uri[]>((resolve, reject) => {
          glob.glob(pattern, (err, matches) => {
            if (err) { resolve([]); }
            resolve(matches.map(match => vscode.Uri.file(match)));
          });
        });
      }

      // Deal with local sources (local paths within the workspace).
      return vscode.workspace.findFiles(pattern);
    }));
    return _.uniqBy(uris.reduce((arr, row) => { return arr.concat(row); }, []), "path");
  }

  private static persist() {
    if (!WorkspaceCache.sourceMap) { return; }
    WorkspaceCache.workspaceState?.update(CACHE_NAME, WorkspaceCache.sourceMap.toJson());
  }
}