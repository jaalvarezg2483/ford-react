import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

export async function payloadClient(): Promise<Payload> {
  return getPayload({ config })
}
