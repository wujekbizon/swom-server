import { promises as fs } from 'node:fs'
import { __dirname, server } from '../server'

// Helper functions
export async function readJsonFile(filePath: string) {
  const data = await fs.readFile(filePath, 'utf8')
  return JSON.parse(data)
}

export async function writeJsonFile(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
}