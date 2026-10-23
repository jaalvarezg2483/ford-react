import { getPayload } from 'payload'
import config from '@payload-config'
import { importContentPages } from '../src/import/contentPages'

try {
  const payload = await getPayload({ config })
  await importContentPages(payload)
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
