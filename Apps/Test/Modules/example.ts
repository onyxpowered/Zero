import type { ZeroModule } from '@zero/engine'

export const ExampleModule: ZeroModule = {
  id:      'Test.example',
  version: '0.0.1',

  async boot()     { console.log('[Test/modules] example booted') },
  async teardown() {},
  onAllocation(_a) {},

  bids() {
    return [{
      moduleId:  'Test.example',
      resource:  'ram',
      requested: 0.25,
      priority:  50,
      reason:    'example module baseline',
      timestamp: Date.now(),
    }]
  },
}
