/// <reference lib="es2015.iterable" />

interface Sync {
  (awaitCount?: number): IterableIterator<Promise<void>>
  sync: Sync
  default: Sync
}

declare const sync: Sync
export = sync
