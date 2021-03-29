/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/git',
    '@semantic-release/github'
  ],
  dryRun: false,
  debug: false
}
