import { describe, expect, it, vi } from 'vitest'
import { createProgram } from './index.js'

function createTestProgram() {
  const handlers = {
    runInit: vi.fn(),
    runAdd: vi.fn(),
    runDev: vi.fn(),
  }
  const program = createProgram(handlers)
  program.exitOverride()
  program.configureOutput({
    writeErr: () => {},
    writeOut: () => {},
  })

  return { program, handlers }
}

describe('CLI command wiring', () => {
  it('forwards init options', async () => {
    const { program, handlers } = createTestProgram()

    await program.parseAsync(['node', 'mountlab', 'init', '--dry-run', '--force'])

    expect(handlers.runInit).toHaveBeenCalledWith({ dryRun: true, force: true })
  })

  it('forwards add options', async () => {
    const { program, handlers } = createTestProgram()

    await program.parseAsync([
      'node',
      'mountlab',
      'add',
      'src/components/Card.vue',
      '--group',
      'Inventory',
      '--wrapper',
      'modal',
      '--dry-run',
      '--force',
    ])

    expect(handlers.runAdd).toHaveBeenCalledWith('src/components/Card.vue', {
      group: 'Inventory',
      wrapper: 'modal',
      dryRun: true,
      force: true,
    })
  })

  it('forwards dev --open option', async () => {
    const { program, handlers } = createTestProgram()

    await program.parseAsync(['node', 'mountlab', 'dev', '--open'])

    expect(handlers.runDev).toHaveBeenCalledWith({ open: true })
  })

  it('keeps dev open disabled by default', async () => {
    const { program, handlers } = createTestProgram()

    await program.parseAsync(['node', 'mountlab', 'dev'])

    expect(handlers.runDev).toHaveBeenCalledWith({ open: false })
  })
})
