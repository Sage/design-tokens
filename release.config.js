/*
Copyright © 2021 The Sage Group plc or its licensors. All Rights reserved
 */
const DIST = 'dist'
const CHANGELOG = 'docs/CHANGELOG.md'
const PACKAGE_JSON = 'package.json'

module.exports = {
  branches: ['master', {name: 'beta', prerelease: true}],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: CHANGELOG
      }
    ],
    [
      '@semantic-release/npm',
      {
        changelogFile: CHANGELOG,
        pkgRoot: DIST,
        tarballDir: DIST
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: [CHANGELOG, PACKAGE_JSON]
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: `${DIST}/*.tgz`
      }
    ]
  ],
  dryRun: false,
  debug: false
}
