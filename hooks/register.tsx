import { atom, read } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { WaMode } from '../types'

const PLUGIN = 'whatsapp-chat'
const STORE_KEY = 'mode'
const BACKDROP = 'whatsapp-fundo'

const modeRef = { plugin: 'whatsapp-chat', key: 'mode' } as const
const mode = atom(modeRef, 'escuro' as WaMode)

type Palette = {
  out: string
  in: string
  text: string
  meta: string
  tick: string
  bg: string
  doodle: string
}

const PALETTES: Record<'claro' | 'escuro', Palette> = {
  claro: {
    out: '#d9fdd3',
    in: '#ffffff',
    text: '#111b21',
    meta: '#667781',
    tick: '#53bdeb',
    bg: '#efeae2',
    doodle: '#d9d1c5',
  },
  escuro: {
    out: '#005c4b',
    in: '#202c33',
    text: '#e9edef',
    meta: '#8696a0',
    tick: '#53bdeb',
    bg: '#0b141a',
    doodle: '#1a252c',
  },
}

// Hora em que o balão apareceu pela primeira vez. As mensagens não trazem
// horário nas props, então a hora é a do primeiro desenho. Some num reload.
const firstSeen = new Map<string, string>()

async function hourFor($: { clock: { now: () => Promise<number> } }, id: string) {
  const known = firstSeen.get(id)
  if (known) return known
  const d = new Date(await $.clock.now())
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const label = `${hh}:${mm}`
  firstSeen.set(id, label)
  return label
}

function isMode(v: unknown): v is WaMode {
  return v === 'claro' || v === 'escuro' || v === 'off'
}

// Padrão de rabiscos próprio (balão, coração, estrela, nota, folha, círculo),
// repetido como a textura do papel de parede do WhatsApp.
function backdropSvg(p: Palette) {
  const s = `fill="none" stroke="${p.doodle}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
  const tile = `
    <path ${s} d="M14 18h30a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H26l-8 7v-7h-4a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z"/>
    <path ${s} d="M98 30c-6-8-18-2-14 7l14 13 14-13c4-9-8-15-14-7z"/>
    <path ${s} d="M160 14l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z"/>
    <path ${s} d="M30 100v-22l18-4v22"/><circle ${s} cx="25" cy="100" r="5"/><circle ${s} cx="43" cy="96" r="5"/>
    <path ${s} d="M96 118c0-20 14-32 32-34-2 18-14 32-32 34zM96 118l18-18"/>
    <circle ${s} cx="168" cy="96" r="9"/><circle ${s} cx="168" cy="96" r="3"/>
    <path ${s} d="M20 160l10-10 10 10-10 10z"/>
    <path ${s} d="M80 170c6-10 16-10 22 0s16 10 22 0"/>
    <path ${s} d="M150 150h24v20h-24zM150 150l12 10 12-10"/>
  `
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1600" viewBox="0 0 2560 1600" preserveAspectRatio="xMidYMid slice">
  <defs><pattern id="wa" width="200" height="200" patternUnits="userSpaceOnUse">${tile}</pattern></defs>
  <rect width="2560" height="1600" fill="${p.bg}"/>
  <rect width="2560" height="1600" fill="url(#wa)"/>
</svg>`
}

async function applyBackdrop($: EngineInterface, m: WaMode) {
  if (m === 'off') return undefined
  return $.theme.set({
    backdrop: {
      id: BACKDROP,
      glass: { blur: 0, opacity: 0.08, tint: PALETTES[m].bg },
      colorScheme: m === 'escuro' ? 'dark' : 'light',
    },
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const stored = await $.store.get(STORE_KEY)
    const m: WaMode = isMode(stored) ? stored : 'escuro'
    await $.state.set(modeRef, m)
    await $.command.register({
      name: 'whatsapp',
      description: 'Visual de WhatsApp na conversa: /whatsapp claro | escuro | off',
      argumentHint: 'claro | escuro | off',
    })
    await applyBackdrop($, m)

    return next(e)
  })

  on('command.run', { command: 'whatsapp' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const current = await read($, mode)
    let next: WaMode
    if (arg === 'claro' || arg === 'light' || arg === 'on') next = 'claro'
    else if (arg === 'escuro' || arg === 'dark') next = 'escuro'
    else if (arg === 'off' || arg === 'desligar') next = 'off'
    else if (arg === '') next = current === 'off' ? 'escuro' : 'off'
    else return { text: 'Use /whatsapp claro, /whatsapp escuro ou /whatsapp off.' }

    await $.state.set(modeRef, next)
    await $.store.set(STORE_KEY, next)
    let fundo = ''
    if (next === 'off') await $.theme.clear()
    else {
      const r = await applyBackdrop($, next)
      fundo = r?.isDrawn ? ' Fundo desenhado.' : ` Fundo não desenhado: ${r?.reason ?? 'sem resposta'}.`
    }

    const msg =
      next === 'off'
        ? 'Visual de WhatsApp desligado.'
        : `Visual de WhatsApp ligado, modo ${next}.${fundo}`
    $.ui.toast(msg)

    return { text: msg }
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== PLUGIN || e.surface === 'terminal') return next(e)
    const m = await read($, mode)
    if (m === 'off') return next(e)
    const { Box, Svg } = $.ui.resolve(e)

    return (
      <Box width="100%" height="100%">
        <Svg source={backdropSvg(PALETTES[m])} alt="Fundo com textura de rabiscos" />
      </Box>
    )
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.surface === 'terminal') return next(e)
    if (e.props.task || e.props.from) return next(e)
    if (e.props.origin.kind === 'task-notification') return next(e)
    const m = await read($, mode)
    if (m === 'off') return next(e)
    const p = PALETTES[m]
    const hora = await hourFor($, e.requestId)
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" justifyContent="flex-end" paddingLeft={8} marginY={0}>
        <Box
          flexDirection="column"
          backgroundColor={p.out}
          borderStyle="round"
          borderColor={p.out}
          paddingX={1}
          flexShrink={1}
        >
          <Text color={p.text}>{e.props.text}</Text>
          <Box flexDirection="row" justifyContent="flex-end" gap={1}>
            <Text size="caption" color={p.meta}>{hora}</Text>
            <Text size="caption" color={p.tick}>✓✓</Text>
          </Box>
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface === 'terminal') return next(e)
    if (e.props.isSummary) return next(e)
    const m = await read($, mode)
    if (m === 'off') return next(e)
    const p = PALETTES[m]
    const hora = await hourFor($, e.requestId)
    const { Box, Text, Markdown, Button } = $.ui.resolve(e)
    const texto = e.props.text

    return (
      <Box flexDirection="row" justifyContent="flex-start" paddingRight={8}>
        <Box
          flexDirection="column"
          backgroundColor={p.in}
          borderStyle="round"
          borderColor={p.in}
          paddingX={1}
          flexShrink={1}
        >
          <Markdown text={texto} />
          <Box flexDirection="row" justifyContent="flex-end" gap={1}>
            <Button
              label="Copiar"
              onPress={press => {
                void $.ui.copy({ text: texto, surface: press.surface })
                $.ui.toast('Resposta copiada.')
              }}
            />
            <Text size="caption" color={p.meta}>{hora}</Text>
          </Box>
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'CommandOutput' }, async ($, e, next) => {
    if (e.surface === 'terminal' || e.props.isErrored) return next(e)
    const m = await read($, mode)
    if (m === 'off') return next(e)
    const p = PALETTES[m]
    const hora = await hourFor($, e.requestId)
    const { Box, Text, Markdown } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" justifyContent="flex-start" paddingRight={8}>
        <Box
          flexDirection="column"
          backgroundColor={p.in}
          borderStyle="round"
          borderColor={p.in}
          paddingX={1}
          flexShrink={1}
        >
          <Markdown text={e.props.text} />
          <Box flexDirection="row" justifyContent="flex-end">
            <Text size="caption" color={p.meta}>{hora}</Text>
          </Box>
        </Box>
      </Box>
    )
  })
}
