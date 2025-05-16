import { defineFunction } from '@andera-top/worker-core'
import { log } from '@andera-top/worker-core/dist/utils/logger'

export const hello = defineFunction({
  params: {
    name: { type: 'string', required: false, default: 'World' },
  },
  config: {
    timeout: 5000,
    maxRetries: 0,
    supportsStreaming: true,
  },
  handler: async (params, context) => {
    log('[HELLO]', `Hello function called for ${params.name} at ${new Date().toISOString()}`)

    if (context?.stream) {
      context.stream(`Hello ${params.name}!`)
      return { streaming: true }
    }
    return { message: `Hello ${params.name}!` }
  },
})
