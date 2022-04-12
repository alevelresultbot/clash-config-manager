const { execSync } = require('child_process')
const pkg = require('./packages/main/package.json')

const sh = (cmd) => {
  console.log('[exec]: %s', cmd)
  execSync(cmd, { stdio: 'inherit' })
}

// env
process.env.NODE_ENV = 'production'

module.exports = {
  appId: pkg.bundleId,
  productName: pkg.productName,

  directories: {
    // output: '',
  },

  files: [
    {
      from: 'bundle/${env.NODE_ENV}',
      to: '.',
    },
    './package.json',
  ],

  extraResources: [
    {
      from: './packages/main/src/bin/clash-config-manager.sh',
      to: '.',
    },
  ],

  beforeBuild() {
    if (process.env.SKIP_BUILD) {
      return
    }

    if (!process.env.SKIP_BUILD_MAIN) {
      console.log('[build main]')
      sh('pnpm build:main')
    }

    if (!process.env.SKIP_BUILD_UI) {
      console.log('[build ui]')
      sh('pnpm build:ui')
    }
  },

  mac: {
    category: 'public.app-category.developer-tools',
    publish: {
      provider: 'github',
    },
  },

  dmg: {
    iconSize: 160,
    contents: [
      {
        x: 180,
        y: 170,
      },
      {
        x: 480,
        y: 170,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
}
