module.exports = {
  'src/**/*.{js,ts}': (filenames) => {
    return filenames.length > 5
      ? 'yarn lint:fix'
      : `yarn eslint --fix ${filenames.join(' ')}`;
  }
};
