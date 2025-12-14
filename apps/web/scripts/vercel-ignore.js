import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const current_file_path = fileURLToPath(import.meta.url)
const current_dir_path = path.dirname(current_file_path)
const root_script_path = path.resolve(current_dir_path, '../../../scripts/vercel-ignore.js')

execSync(`node ${root_script_path}`, {
    stdio: 'inherit'
})
