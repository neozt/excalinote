import { Injectable, DestroyRef, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { fromEvent } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

type ShortcutHandler = (event: KeyboardEvent) => void;

export type ShortcutId = string;

@Injectable({
  providedIn: "root",
})
export class ShortcutService {
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);

  // Stores full handler details
  private handlers = new Map<
    ShortcutId,
    { keys: string[]; action: ShortcutHandler }
  >();

  // Secondary index: key -> ShortcutId[]
  private keyIndex = new Map<string, ShortcutId[]>();

  constructor() {
    fromEvent<KeyboardEvent>(this.document, "keydown")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const key = event.key;
        const ids = this.keyIndex.get(key);
        if (!ids || ids.length === 0) {
          return;
        }

        const lastId = ids[ids.length - 1];
        const handlerEntry = this.handlers.get(lastId);
        if (handlerEntry && handlerEntry.keys.includes(event.key)) {
          handlerEntry.action(event);
        }
      });
  }

  register(keys: string[], action: ShortcutHandler): ShortcutId {
    const id = this.generateShortcutId();
    this.handlers.set(id, { keys, action });

    // Add to key index
    for (const key of keys) {
      const list = this.keyIndex.get(key) ?? [];
      list.push(id);
      this.keyIndex.set(key, list);
    }

    return id;
  }

  unregister(id: ShortcutId) {
    const entry = this.handlers.get(id);
    if (!entry) {
      return;
    }

    // Remove from key index
    for (const key of entry.keys) {
      const shortcutIds = this.keyIndex.get(key);
      if (shortcutIds) {
        const removed = shortcutIds.filter((existingId) => existingId !== id);
        if (removed.length === 0) {
          this.keyIndex.delete(key);
        } else {
          this.keyIndex.set(key, removed);
        }
      }
    }

    this.handlers.delete(id);
  }

  private generateShortcutId(): ShortcutId {
    return crypto.randomUUID();
  }
}
