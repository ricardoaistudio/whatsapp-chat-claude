import { expect, test } from 'claude-code/testing'

const USER = {
  plugin: 'whatsapp-chat',
  component: 'UserMessage',
  requestId: 'u1',
  props: {
    text: 'oi, tudo bem?',
    origin: { kind: 'composer' },
    isExpanded: true,
  },
} as const

const ASSISTANT = {
  plugin: 'whatsapp-chat',
  component: 'AssistantMessage',
  requestId: 'a1',
  props: { text: 'Tudo, e **você**?', isFirstOfReply: true },
} as const

test('balões no desktop, com hora e tique', async ($, on) => {
  on('clock.now', () => ({ value: Date.UTC(2026, 10, 13, 14, 5) }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

  const u = await $.ui.mount({ ...USER, surface: 'desktop' } as any)
  expect((await u.find({ type: 'Text', text: /oi, tudo bem/ }))?.text).toBe('oi, tudo bem?')
  expect((await u.find({ type: 'Text', text: /✓✓/ }))?.text).toBe('✓✓')
  expect((await u.find({ type: 'Text', text: /^\d\d:\d\d$/ }))).toBeTruthy()
  await u.unmount()

  const a = await $.ui.mount({ ...ASSISTANT, surface: 'desktop' } as any)
  expect((await a.find({ type: 'Text', text: /^\d\d:\d\d$/ }))).toBeTruthy()
  await a.unmount()
})

test('o terminal fica como está', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })
  const u = await $.ui.mount({ ...USER, surface: 'terminal' } as any)
  expect((await u.find({ type: 'Text', text: /engine/ }))?.text).toBe('engine')
  await u.unmount()
})
