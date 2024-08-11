/** ================================================================================================== **
 ** REFACTORIO                                                                                         **
 **  @Author Valerii Bubenshchikov, 2024                                                               **
 **  @License MIT                                                                                      **
 **  @Description This file is part of the Refactorio project, a tool for automatic code refactoring.  **
 ** ================================================================================================== */
import { requireDisclaimer } from './requireDisclaimer.mjs';

/** @type import('eslint').ESLint.Plugin */
export default {
  meta: {
    name: 'eslint-plugin-local-rules',
    version: '1.0.0'
  },
  rules: {
    'require-disclaimer': requireDisclaimer
  }
};
