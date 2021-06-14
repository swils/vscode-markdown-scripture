import * as _ from "lodash";
import * as vscode from "vscode";
import * as Utils from "./Utils";

/**
 * The `SourceMapObject` is stored for persisted storage (such as
 * `vscode.Memento`).
 *
 * Upon retrieval from persisted storage, it should be wrapped in a `SourceMap`
 * object for comfortable usage.
 */
export interface SourceMapObject<T> {
  keyToFsPathMap: { [key:string]: string };
  fsPathToEntryMap: { [key:string]: T };
}

/**
 * `SourceMap retrieves a source (wrapped in some class T which may contain
 * additional information, such as a timestamp), based on one of its key or on
 * its full filesystem path.
 */
export class SourceMap<T> {
  #sourceMapObject: SourceMapObject<T>;

  constructor(sourceMapObject?: SourceMapObject<T>) {
    this.#sourceMapObject = sourceMapObject ? sourceMapObject : {
      keyToFsPathMap: { },
      fsPathToEntryMap: { }
    };
  }

  // public fetch({ book, ranges }: Query): string | undefined {
  //   const source = this.byKey(book);
  //   return source ? Source.fetch(source, ranges) : undefined;
  // }

  public byKey(key: string): T | undefined {
    const path = this.#sourceMapObject.keyToFsPathMap[key];
    return path ? this.byPath(path) : undefined;
  }

  public byPath(path: string): T | undefined {
    return this.#sourceMapObject.fsPathToEntryMap[path];
  }

  /**
   * Add a entry with a filesystem path to the map.
   *
   * If the key(s) computed for a file leads to duplicate keys, then an
   * exception is thrown.
   *
   * @param fsPath The file system path
   * @param wrappedObject
   */
  public add(fsPath: string, wrappedObject: T) {
    if (this.#sourceMapObject.fsPathToEntryMap[fsPath]) {
      throw new Error("Cannot add source file twice");
    }

    const keys = Utils.keysForSourceFile(fsPath);
    if (keys.length === 0) { return; }

    const duplicateKeys = this.usedKeysIn(keys);
    if (duplicateKeys.length !== 0) {
      const workspacePath = vscode.workspace.asRelativePath(fsPath);
      throw new Error(`Adding ${workspacePath} would cause duplicate keys (${duplicateKeys.concat(", ")})`);
    }

    this.#sourceMapObject.fsPathToEntryMap[fsPath] = wrappedObject;
    for (const key of keys) {
      this.#sourceMapObject.keyToFsPathMap[key] = fsPath;
    }
  }

  public update(fsPath: string, wrappedObject: T) {
    if (!this.#sourceMapObject.fsPathToEntryMap[fsPath]) {
      throw new Error("Cannot update source file which is not yet added");
    }
    this.#sourceMapObject.fsPathToEntryMap[fsPath] = wrappedObject;
  }

  public remove(fsPath: string) {
    this.#sourceMapObject.keyToFsPathMap = _(this.#sourceMapObject.keyToFsPathMap)
      .toPairs()
      .filter(([ key, path ]) => path === fsPath)
      .fromPairs()
      .value();
    _.unset(this.#sourceMapObject.fsPathToEntryMap, fsPath);
  }

  public prune(newFsPaths: string[]) {
    const newFsPathsSet = new Set(newFsPaths);
    _(this.#sourceMapObject.fsPathToEntryMap).keys().forEach((fsPath) => {
      if (!newFsPathsSet.has(fsPath)) {
        this.remove(fsPath);
      }
    });
  }

  public toJson() { return this.#sourceMapObject; }

  public static fromJson<T>(object: SourceMapObject<T>): SourceMap<T> {
    return new SourceMap<T>(object);
  }

  public static isCacheObject<T>(o: unknown): o is SourceMapObject<T> {
    if (!_.has(o, "keyToFsPathMap")) { return false; }
    if (!_.has(o, "fsPathToEntryMap")) { return false; }
    return true;
  }

  private usedKeysIn(keys: string[]): string[] {
    const { keyToFsPathMap } = this.#sourceMapObject;
    return _.filter(keys, (key) => !!keyToFsPathMap[key]);
  }
}