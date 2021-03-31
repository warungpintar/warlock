module.exports = {
  release: {
    branch: 'master'
  },
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ["@semantic-release/gitlab", {
      "gitlabUrl": "https://gitlab.warungpintar.co"
    }],
    '@semantic-release/npm',
    [
      "@semantic-release/git",
      {
        "assets": ["package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
