import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const proxyTarget = String(process.env.API_PROXY_TARGET || '').trim().replace(/\/+$/, '')
const redirects = []

if (proxyTarget) {
  const url = new URL(proxyTarget)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('API_PROXY_TARGET must use http:// or https://')
  }

  redirects.push(`/api/*  ${proxyTarget}/api/:splat  200`)
}

// React Router fallback must always be the final rule.
redirects.push('/*  /index.html  200')

const outputPath = path.resolve('dist/_redirects')
await fs.mkdir(path.dirname(outputPath), { recursive: true })
await fs.writeFile(outputPath, `${redirects.join('\n')}\n`, 'utf8')

if (proxyTarget) {
  console.log(`Netlify API proxy configured for ${proxyTarget}`)
} else {
  console.warn('API_PROXY_TARGET is not set; generated only the SPA fallback rule.')
}
