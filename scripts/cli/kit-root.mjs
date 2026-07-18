import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/** Absolute path to the @default-file/ui package root. */
export function kitRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
}

export function kitPath(...segments) {
  return path.join(kitRoot(), ...segments)
}

export function readKitJson(...segments) {
  const filePath = kitPath(...segments)
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

export function kitFileExists(...segments) {
  try {
    fs.accessSync(kitPath(...segments))
    return true
  } catch {
    return false
  }
}
