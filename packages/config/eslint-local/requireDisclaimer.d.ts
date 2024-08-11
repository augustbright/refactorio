/** ================================================================================================== **
 ** REFACTORIO                                                                                         **
 **  @Author Valerii Bubenshchikov, 2024                                                               **
 **  @License MIT                                                                                      **
 **  @Description This file is part of the Refactorio project, a tool for automatic code refactoring.  **
 ** ================================================================================================== */
import { Rule } from 'eslint';

declare module './requireDisclaimer' {
  export const requireDisclaimer: Rule.RuleModule;
}
