import { Command } from 'commander'
import { runInit } from './commands/init.js'
import { runAdd } from './commands/add.js'
import { runDev } from './commands/dev.js'

const program = new Command()

program
  .name('mountlab')
  .description('Component workbench for Vue 3 + Vite')
  .version('0.0.1')

program
  .command('init')
  .description('Initialize MountLab in the current project')
  .option('--dry-run', 'preview changes without writing files')
  .option('--force', 'overwrite existing files')
  .action((opts) =>
    runInit({
      dryRun: opts.dryRun ?? false,
      force: opts.force ?? false,
    }),
  )

program
  .command('add <component-path>')
  .description('Scaffold a .case.ts file for a component')
  .option('--group <name>', 'sidebar group for the generated case', 'Components')
  .option('--wrapper <key>', 'wrapper key for the generated case', 'default')
  .option('--dry-run', 'preview changes without writing files')
  .option('--force', 'overwrite existing case file')
  .action((componentPath, opts) =>
    runAdd(componentPath, {
      group: opts.group,
      wrapper: opts.wrapper,
      dryRun: opts.dryRun ?? false,
      force: opts.force ?? false,
    }),
  )

program
  .command('dev')
  .description('Start the MountLab workbench dev server')
  .action(runDev)

program.parse()
