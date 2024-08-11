'use strict';

import { RuleTester } from 'eslint';

import { requireDisclaimer } from '../requireDisclaimer';

const ruleTester = new RuleTester();

describe('requireDisclaimer', () => {
  const expectedDisclaimer = `/** DISCLAIMER          **
 ** This is a test file **
 ** DISCLAIMER          */`;

  ruleTester.run('requireDisclaimer', requireDisclaimer, {
    valid: [
      {
        code: `
${expectedDisclaimer}

          print('Hello, world!')
          `,
        options: [
          {
            boundary: 'DISCLAIMER',
            disclaimer: 'This is a test file'
          }
        ]
      }
    ],

    invalid: [
      {
        code: `
print('Hello, world!')`,
        errors: [{ message: 'Missing the disclaimer comment.' }],
        options: [
          {
            boundary: 'DISCLAIMER',
            disclaimer: 'This is a test file'
          }
        ],
        output: `
${expectedDisclaimer}
print('Hello, world!')`
      },
      {
        code: `${expectedDisclaimer}

${expectedDisclaimer}

print('Hello, world!')`,
        errors: [{ message: 'Multiple disclaimer comments found.' }],
        options: [
          {
            boundary: 'DISCLAIMER',
            disclaimer: 'This is a test file'
          }
        ],
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
        options: [
          {
            boundary: 'DISCLAIMER',
            disclaimer: 'This is a test file'
          }
        ],
        output: `
${expectedDisclaimer}

print('Hello, world!')`
      }
    ]
  });
});
