module.exports = {
  packagerConfig: {
    osxSign: {}, // object must exist even if empty
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      platforms: ['darwin'],
      config: {
        repository: {
          owner: 'dotgrid',
          name: 'monotime',
        },
        authToken: process.env.GITHUB_MONOTIME_PAT,
        prerelease: true
      }
    }
  ]
};
