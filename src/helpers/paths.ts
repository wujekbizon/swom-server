import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Helper function to get absolute path to data files
 * @param dataFileName - Name of the file in data directory
 * @returns Absolute path to the file
 */
export function getDataFilePath(dataFileName: string): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  return path.join(__dirname, '../../src/data', dataFileName)
}

// Common data file paths
export const USERS_FILE = getDataFilePath('mock-users.json')
export const DUTIES_FILE = getDataFilePath('mock-duties.json')
export const PATIENTS_FILE = getDataFilePath('mock-patients.json') 