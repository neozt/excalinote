import {
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { bufferTime, filter, Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Note } from "@shared/models/note.model";
import { NoteStore } from "@features/dashboard/services/note.store";

@Component({
  selector: "app-note-title",
  imports: [CommonModule],
  host: {
    "(click)": "clicks.next()",
  },
  templateUrl: "./note-title-list-item.component.html",
  styleUrl: "./note-title-list-item.component.css",
})
export class NoteTitleListItem {
  private noteStore = inject(NoteStore);

  clicks = new Subject<void>();
  private bufferedClicks = this.clicks.pipe(bufferTime(250, undefined, 2));
  private singleClicks = this.bufferedClicks.pipe(
    filter((buffered) => buffered.length === 1),
  );
  private doubleClicks = this.bufferedClicks.pipe(
    filter((buffered) => buffered.length > 1),
  );

  note = input.required<Note>();

  valueChange = output<string>();

  editing = signal(false);
  titleBox = viewChild<ElementRef>("titleBox");

  constructor() {
    this.singleClicks.pipe(takeUntilDestroyed()).subscribe(() => {
      this.noteStore.selectNote(this.note().id);
    });

    this.doubleClicks.pipe(takeUntilDestroyed()).subscribe(() => {
      this.startEditing();
    });
  }

  startEditing() {
    this.editing.set(true);
    setTimeout(() => {
      this.selectTitle(this.titleBox()?.nativeElement);
    });
  }

  stopEditing(updatedTitle: string) {
    this.editing.set(false);
    this.valueChange.emit(updatedTitle);
  }

  private selectTitle(el: HTMLElement) {
    if (!el) {
      return;
    }
    el.focus();

    const range = document.createRange();
    range.selectNodeContents(el);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
