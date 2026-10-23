import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

export function payloadClient(): Promise<Payload> {
  return getPayload({ config })
}
