export async function runDev(): Promise<void> {
  console.log('[MountLab] mountlab dev — not yet implemented.')
  console.log()
  console.log('  This command will:')
  console.log('    • Load mountlab.config.ts from the project root')
  console.log('    • Load and merge the user\'s Vite config')
  console.log('    • Glob for *.case.ts files matching the cases config pattern')
  console.log('    • Inject the MountLab Vite plugin and virtual modules')
  console.log('    • Start a Vite dev server on the configured port (default: 4300)')
  console.log('    • Open the MountLab workbench at http://localhost:4300')
  console.log('    • Watch for case file changes and update the registry (HMR)')
}
