/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const path = require("path");
const fs = require("fs");

const TYPESCRIPT_LIB_SOURCE = path.join(__dirname, "../node_modules/typescript/lib");
const TYPESCRIPT_LIB_DESTINATION = path.join(__dirname, "../src/lib");

(function() {
  try {
    fs.statSync(TYPESCRIPT_LIB_DESTINATION);
  } catch (err) {
    fs.mkdirSync(TYPESCRIPT_LIB_DESTINATION);
  }

  var tsServices = fs.readFileSync(path.join(TYPESCRIPT_LIB_SOURCE, "typescriptServices.js")).toString();

  // Ensure we never run into the node system...
  // (this also removes require calls that trick webpack into shimming those modules...)
  tsServices = tsServices.replace(
    /\n    ts\.sys =([^]*)\n    \}\)\(\);/m,
    `\n    // MONACOCHANGE\n    ts.sys = undefined;\n    // END MONACOCHANGE`
  );

  var tsServices_esm =
    tsServices +
    `
// MONACOCHANGE
export const createClassifier = ts.createClassifier;
export const createLanguageService = ts.createLanguageService;
export const displayPartsToString = ts.displayPartsToString;
export const EndOfLineState = ts.EndOfLineState;
export const flattenDiagnosticMessageText = ts.flattenDiagnosticMessageText;
export const IndentStyle = ts.IndentStyle;
export const ScriptKind = ts.ScriptKind;
export const ScriptTarget = ts.ScriptTarget;
export const TokenClass = ts.TokenClass;
// END MONACOCHANGE
`;
  fs.writeFileSync(path.join(TYPESCRIPT_LIB_DESTINATION, "typescriptServices.js"), tsServices_esm);

  var dtsServices = fs.readFileSync(path.join(TYPESCRIPT_LIB_SOURCE, "typescriptServices.d.ts")).toString();
  dtsServices += `
// MONACOCHANGE
export = ts;
// END MONACOCHANGE
`;
  fs.writeFileSync(path.join(TYPESCRIPT_LIB_DESTINATION, "typescriptServices.d.ts"), dtsServices);
})();
