import * as _ from "lodash";
import * as vscode from "vscode";

export interface SourceConfig {
  include?: string;
  ref?: string;
}

export interface Config {
  sources: SourceConfig[];
}

const DEFAULTS: Config = {
  sources: []
};

export function get(): Config {
  let config = vscode.workspace.getConfiguration("markdownScripture");
  return _.defaults(config, DEFAULTS);
}