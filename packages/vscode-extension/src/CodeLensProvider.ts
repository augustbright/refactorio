import { parse } from 'engine/parser';
import { tokenize } from 'engine/tokenizer';
import * as vscode from 'vscode';

export class RefactorioCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.CodeLens[] {
    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();
    const tokens = tokenize(text);
    const program = parse(tokens);

    codeLenses.push(
      new vscode.CodeLens(
        new vscode.Range(document.positionAt(0), document.positionAt(1)),
        {
          title: 'Evaluate script',
          command: 'refactorio.evaluateScript',
          arguments: [program, token]
        }
      )
    );

    return codeLenses;
  }
}
