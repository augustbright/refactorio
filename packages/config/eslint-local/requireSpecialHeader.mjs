/**@type import('eslint').Rule.RuleModule */
export const requireSpecialHeader = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Append a special header to the file, e.g. a license or disclaimer'
    },
    fixable: 'code',
    // accepts disclaimer content and boundary string as options
    schema: [
      {
        type: 'object',
        properties: {
          disclaimer: {
            type: 'string'
          },
          boundary: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create: function (context) {
    return {
      Program: function (node) {
        // get disclaimer body and boundary string from options
        const options = context.options[0];
        const disclaimer = options.disclaimer;
        const boundary = options.boundary;

        // get all the comments from node.comments;
        // check if the disclaimer comment exists among all comments
        //  if the disclaimer is found, check if it matches the expected disclaimer
        //    if it matches, do nothing
        //    if it doesn't match, report an error
        //  if the disclaimer is not found, report an error

        const comments = node.comments;

        const formattedDisclaimer = () =>
          disclaimer
            .split('\n')
            .map((line) => ` * ${line}`)
            .join('\n');
        const expectedDisclaimerComment = [
          `/* ${boundary}`,
          formattedDisclaimer(),
          `   ${boundary} */`
        ].join('\n');

        /**@type import('eslint').Rule.ReportFixer*/
        const missingCommentFixer = (fixer) => {
          const sourceCode = context.sourceCode;
          const text = sourceCode.getText(node);
          const newCode = [
            expectedDisclaimerComment,
            text.match(/^\s*(?<code>\S.*)$/)?.groups?.code || text
          ].join('\n');
          return fixer.replaceText(node, newCode);
        };
        if (!comments) {
          context.report({
            node,
            message: 'Missing the disclaimer comment.',
            fix: missingCommentFixer
          });
          return;
        }
        const isDisclaimer = (text) => {
          const lines = text.split('\n');
          return (
            lines[0].trim() === boundary && lines.at(-1).trim() === boundary
          );
        };
        const disclaimerComments = comments.filter((comment) =>
          isDisclaimer(comment.value)
        );
        if (disclaimerComments.length === 0) {
          context.report({
            node,
            message: 'Missing the disclaimer comment.',
            fix: missingCommentFixer
          });
          return;
        } else if (disclaimerComments.length > 1) {
          context.report({
            node,
            message: 'Multiple disclaimer comments found.',
            fix(fixer) {
              return disclaimerComments.slice(1).map((comment) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                return fixer.removeRange(comment.range);
              });
            }
          });
          return;
        }

        const disclaimerComment = disclaimerComments[0];
        const matches = (actualDisclaimer) => {
          const actualLines = actualDisclaimer.split('\n').slice(1, -1);
          const expectedLines = disclaimer.split('\n');
          return (
            actualLines.length === expectedLines.length &&
            actualLines.every(
              (line, index) => line === ` * ${expectedLines[index]}`
            )
          );
        };

        if (!matches(disclaimerComment.value)) {
          context.report({
            node,
            message: 'The disclaimer comment does not match the expected.',
            fix(fixer) {
              return fixer.replaceTextRange(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                disclaimerComment.range,
                expectedDisclaimerComment
              );
            }
          });
        }

        // success: The disclaimer is found and matches the expected
      }
    };
  }
};
