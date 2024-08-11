'use strict';

import { RuleTester } from 'eslint';

import { requireDisclaimer } from '../requireDisclaimer';

const ruleTester = new RuleTester();

describe('requireDisclaimer', () => {
  const expectedDisclaimer = `/** DISCLAIMER          **
 ** This is a test file **
 ** DISCLAIMER          */`;

  const ruleOptions = {
    boundary: 'DISCLAIMER',
    disclaimer: 'This is a test file'
  };

  ruleTester.run('requireDisclaimer', requireDisclaimer, {
    valid: [
      {
        code: `
${expectedDisclaimer}

          print('Hello, world!')
          `,
        options: [ruleOptions]
      }
    ],

    invalid: [
      {
        code: `
print('Hello, world!')`,
        errors: [{ message: 'Missing the disclaimer comment.' }],
        options: [ruleOptions],
        output: `
${expectedDisclaimer}
print('Hello, world!')`
      },
      {
        code: `${expectedDisclaimer}

${expectedDisclaimer}

print('Hello, world!')`,
        errors: [{ message: 'Multiple disclaimer comments found.' }],
        options: [ruleOptions],
        output: `${expectedDisclaimer}



print('Hello, world!')`
      },
      {
        code: `
/** DISCLAIMER          **
 ** This is WRONG       **
 ** DISCLAIMER          */

print('Hello, world!')`,
        errors: [
          { message: 'The disclaimer comment does not match the expected.' }
        ],
        options: [ruleOptions],
        output: `
${expectedDisclaimer}

print('Hello, world!')`
      }
    ]
  });
});
