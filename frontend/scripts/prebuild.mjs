import {spawnSync} from 'node:child_process'

if (process.env.VERCEL === '1') {
  console.log('Skipping Sanity typegen on Vercel; using committed sanity.schema.json and sanity.types.ts')
  process.exit(0)
}

const result = spawnSync('npm', ['run', 'sanity:typegen'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(result.status ?? 1)
