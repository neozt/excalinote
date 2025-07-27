import { DestroyRef, DOCUMENT, inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter, fromEvent } from "rxjs";

@Injectable()
export class ShortcutService {
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);

  registerShortcut({
    keys,
    action,
  }: {
    keys: string[];
    action: (event: KeyboardEvent) => void;
  }) {
    fromEvent<KeyboardEvent>(this.document, "keydown")
      .pipe(
        filter((event) => keys.includes(event.key)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(action);
  }
}
