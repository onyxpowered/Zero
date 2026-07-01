import type { ZeroModule, ManageAPI } from '@zero/engine/manage'

export const ExampleModule: ZeroModule = {
  id:      'ClaudesThrone.example',
  version: '0.0.1',

  async boot(api: ManageAPI) {
    console.log('[ClaudesThrone/modules] example booted')
    api.emit({ type: 'module.load', id: 'ClaudesThrone.example', version: '0.0.1' })
  },
  async teardown() {},
  onAllocation(_a) {},

  bids() {
    return [{
      moduleId:  'ClaudesThrone.example',
      resource:  'ram',
      requested: 0.25,
      priority:  50,
      reason:    'ClaudesThrone example module',
      timestamp: Date.now(),
    }]
  },
}
