'use strict';

import { RuleTester } from 'eslint';

import { requireSpecialHeader } from '../requireSpecialHeader';

const ruleTester = new RuleTester();

describe('requireSpecialHeader', () => {
  ruleTester.run('requireSpecialHeader', requireSpecialHeader, {
    valid: [
      {
        code: `
/* DISCLAIMER 
 * This is a test file
   DISCLAIMER */

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
/* DISCLAIMER
 * This is a test file
   DISCLAIMER */
print('Hello, world!')`
      },
      {
        code: `/* DISCLAIMER
 * This is a test file
   DISCLAIMER */

/* DISCLAIMER
 * This is a test file
   DISCLAIMER */

print('Hello, world!')`,
        errors: [{ message: 'Multiple disclaimer comments found.' }],
        options: [
          {
            boundary: 'DISCLAIMER',
            disclaimer: 'This is a test file'
          }
        ],
        output: `/* DISCLAIMER
 * This is a test file
   DISCLAIMER */



print('Hello, world!')`
      },
      {
        code: `
/* DISCLAIMER
 * Wrong disclaimer
   DISCLAIMER */

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
/* DISCLAIMER
 * This is a test file
   DISCLAIMER */

print('Hello, world!')`
      }
    ]
  });
});
