// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import removeColumn from "./index";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "rmcolsqlinsert.rmcol",
    () => {
      let fPath = vscode.workspace?.workspaceFolders?.[0].uri.path;
      vscode.window
        .showInputBox({
          title: "ENTER COLUMN INDEX!",
        })
        .then((val) => {
          try {
            const colIndex = Number(val);

            if (!fPath) {
              vscode.window.showErrorMessage(
                "Can not find path to your folder!"
              );
              return;
            }

            removeColumn(colIndex, fPath);
          } catch (error: any) {
            let errorMessage = "";
            if (error.message) {
              if (error.message.includes("input.sql")) {
                errorMessage = "Please add input.sql file at your root folder!";
              } else {
                errorMessage = error.message;
              }
            }

            vscode.window.showErrorMessage(errorMessage);
          }
        });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
