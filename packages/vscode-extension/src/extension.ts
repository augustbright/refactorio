import { TProgram } from '@refactorio/engine';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'refactorio.evaluateScript',
      (program: TProgram /*, _token: vscode.CancellationToken */) => {
        vscode.window.showInformationMessage(
          `Evaluating script: ${JSON.stringify(program, null, 3)}`
        );
        // Add your evaluation logic here
      }
    )
  );
}

export function deactivate() {}
