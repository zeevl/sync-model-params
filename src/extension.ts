'use strict';

import * as Path from 'path';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "sync-model-params" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand('extension.syncModelParams', syncModelParams);

  context.subscriptions.push(disposable);
}

function syncModelParams() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  let doc = editor.document.getText();
  const paramsSearch = /type params = \{([^}]+)}/i.exec(doc);
  if (!paramsSearch) {
    vscode.window.showInformationMessage('Cant find type params = {...}!');
    return;
  }

  let params = paramsSearch[1].split('\n');
  params = params.map(p => p.replace(/,$/, '').trim());
  params = params.filter(p => p);

  const classProps = getClassProps(params);
  const recordProps = getRecordDefaults(params);

  const filename = Path.basename(editor.document.fileName, Path.extname(editor.document.fileName));
  const classname = filename.charAt(0).toUpperCase() + filename.slice(1);

  const classDecl = `class ${classname} extends Record({ ${recordProps} }) {
  ${classProps}
  constructor`;

  const classRe = /class .+[\s\S]+constructor/
  const existingSearch = classRe.test(doc);
  if (existingSearch) {
    doc = doc.replace(classRe, classDecl);
  }
  else {
    doc += `export ${classDecl}(params?: params) {
    params ? super(params) : super();
  }

  with(values: params) {
    return this.merge(values) as this;
  }
}
`
  }

  editor.edit((editBuilder => editBuilder.replace(fullDocumentRange(editor.document), doc)));
}

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
  const lastLineId = document.lineCount - 1;
  return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}

function getClassProps(params: string[]): string {
  return `${params.join(';\n  ')};\n`;
}

function getRecordDefaults(params: string[]): string {
  return params.reduce((val, param) => {
    const [name, type] = param.split(':');
    let def = '';

    switch (type.trim()) {
      case 'string':
        def = "''";
        break;

      case 'number':
        def = '0';
        break;

      default:
        def = `new ${type.trim()}()`;
        break;
    }

    return `${val ? `${val}, ` : ''}${name}: ${def}`;
  }, '')
}

// this method is called when your extension is deactivated
export function deactivate() {
}