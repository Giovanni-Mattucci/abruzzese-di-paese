/** Node-only surface (file system, Ajv) for scripts and tests. Never import from browser code. */
export * from './index';
export {
  formatEntry,
  loadEntryFiles,
  validateEntryFiles,
  type EntryFile,
  type ValidationError,
} from './validate';
