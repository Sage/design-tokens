/*
Copyright © 2024 The Sage Group plc or its licensors. All Rights reserved
 */
const DIST = 'dist'
const CHANGELOG = 'docs/CHANGELOG.md'
const PACKAGE_JSON = 'package.json'

module.exports = {
  branches: ['master', { name: 'beta', prerelease: true }],
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
      '@amanda-mitchell/semantic-release-npm-multiple',
      {
        registries: {
          github: {
            changelogFile: CHANGELOG,
            pkgRoot: DIST,
            tarballDir: DIST
          },
          public: {
            changelogFile: CHANGELOG,
            pkgRoot: DIST
          },
          x3: {
            changelogFile: CHANGELOG,
            pkgRoot: DIST
          }
        }
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
