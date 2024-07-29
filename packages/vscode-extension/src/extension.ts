import { TProgram } from 'engine/types/ast';
import * as vscode from 'vscode';

import { RefactorioCodeLensProvider } from './CodeLensProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: 'refactorio' },
      new RefactorioCodeLensProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'refactorio.evaluateScript',
      (program: TProgram /*, _token: vscode.CancellationToken */) => {
        vscode.window.showInformationMessage(
          `Evaluating program: ${JSON.stringify(program, null, 3)}`
        );
        // Add your evaluation logic here
      }
    )
  );
}

export function deactivate() {}
