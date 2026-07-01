export interface ZeroFrameworkDetector {
  path?:         string
  matchContent?: string
  matchPackage?: string
}

export interface ZeroFrameworkDetectors {
  every?: ZeroFrameworkDetector[]
  some?:  ZeroFrameworkDetector[]
}

export interface ZeroFrameworkSetting<T = string | null> {
  value?:                   T
  placeholder?:             string
  ignorePackageJsonScript?: boolean
}

export interface ZeroFrameworkSettings {
  installCommand:  ZeroFrameworkSetting
  buildCommand:    ZeroFrameworkSetting
  devCommand:      ZeroFrameworkSetting
  outputDirectory: ZeroFrameworkSetting
}

export type ZeroEngineName = 'node' | 'python' | 'go' | 'ruby' | 'rust' | 'static'

export interface ZeroFramework {
  name:              string
  slug:              string | null
  engine?:           ZeroEngineName
  tagline?:          string
  description?:      string
  envPrefix?:        string
  sort?:             number
  experimental?:     boolean
  runtimeFramework?: boolean
  supersedes?:       string[]
  detectors?:        ZeroFrameworkDetectors
  settings:          ZeroFrameworkSettings
}

export interface ZeroFilesystemStat {
  name: string
  path: string
  type: 'file' | 'dir'
}
