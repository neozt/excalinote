import { Injectable, DestroyRef, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { fromEvent } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AtLeast } from "@shared/utils/types.util";

export type ShortcutId = string;

type ShortcutHandler = (event: KeyboardEvent) => void;

type ShortcutKey = {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
};

type PartialShortcutKey = AtLeast<ShortcutKey, "key">;


@Injectable({
  providedIn: "root",
})
export class ShortcutService {
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);

  // Stores full handler details
  private handlers = new Map<
    ShortcutId,
    { keys: ShortcutKey[]; action: ShortcutHandler }
  >();

  // Secondary index: key -> ShortcutId[]
  private keyIndex = new Map<string, ShortcutId[]>();

  constructor() {
    fromEvent<KeyboardEvent>(this.document, "keydown")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const comboKey = this.getComboKeyFromEvent(event);
        const ids = this.keyIndex.get(comboKey);
        if (!ids || ids.length === 0) {
          return;
        }

        const lastId = ids[ids.length - 1];
        const handlerEntry = this.handlers.get(lastId);
        if (handlerEntry) {
          handlerEntry.action(event);
        }
      });
  }

  register(
    keys: Array<string | PartialShortcutKey>,
    action: ShortcutHandler,
  ): ShortcutId {
    const id = this.generateShortcutId();
    const normalizedKeys = keys.map((key) => this.normalizeShortcutKey(key));
    this.handlers.set(id, { keys: normalizedKeys, action });

    // Add to key index
    for (const key of normalizedKeys) {
      const comboKey = this.getComboKey(key);
      const list = this.keyIndex.get(comboKey) ?? [];
      list.push(id);
      this.keyIndex.set(comboKey, list);
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
      const comboKey = this.getComboKey(key);
      const shortcutIds = this.keyIndex.get(comboKey);
      if (shortcutIds) {
        const removed = shortcutIds.filter((existingId) => existingId !== id);
        if (removed.length === 0) {
          this.keyIndex.delete(comboKey);
        } else {
          this.keyIndex.set(comboKey, removed);
        }
      }
    }

    this.handlers.delete(id);
  }

  private generateShortcutId(): ShortcutId {
    return crypto.randomUUID();
  }

  private normalizeShortcutKey(key: string | PartialShortcutKey): ShortcutKey {
    if (typeof key === "string") {
      return {key: key, ctrl: false, shift: false, alt: false, meta: false};
    } else {
      return {
        key: key.key,
        ctrl: !!key.ctrl,
        shift: !!key.shift,
        alt: !!key.alt,
        meta: !!key.meta,
      };
    }
  }

  private getComboKey(shortcut: ShortcutKey): string {
    const parts = [];
    if (shortcut.ctrl) parts.push("ctrl");
    if (shortcut.alt) parts.push("alt");
    if (shortcut.shift) parts.push("shift");
    if (shortcut.meta) parts.push("meta");
    parts.push(shortcut.key.toLowerCase());
    return parts.join("-");
  }

  private getComboKeyFromEvent(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push("ctrl");
    if (event.altKey) parts.push("alt");
    if (event.shiftKey) parts.push("shift");
    if (event.metaKey) parts.push("meta");
    parts.push(event.key.toLowerCase());
    return parts.join("-");
  }
}
