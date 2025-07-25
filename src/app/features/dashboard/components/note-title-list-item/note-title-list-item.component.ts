import {
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Note } from "@shared/models/note.model";
import { NoteStore } from "@features/dashboard/services/note.store";

@Component({
  selector: "app-note-title",
  imports: [CommonModule],
  host: {
    "(click)": "handleClicks()",
  },
  templateUrl: "./note-title-list-item.component.html",
  styleUrl: "./note-title-list-item.component.css",
})
export class NoteTitleListItem {
  private noteStore = inject(NoteStore);

  private titleBox = viewChild<ElementRef>("titleBox");

  public note = input.required<Note>();
  editing = signal(false);

  private doubleClickTimeout: ReturnType<typeof setTimeout> | null = null;

  handleClicks() {
    if (this.editing()) {
      return;
    }

    if (this.doubleClickTimeout) {
      clearTimeout(this.doubleClickTimeout);
      this.doubleClickTimeout = null;
      this.handleDoubleClick();
    } else {
      this.doubleClickTimeout = setTimeout(() => {
        this.doubleClickTimeout = null;
        this.handleSingleClick();
      }, 250);
    }
  }

  private handleSingleClick() {
    this.noteStore.selectNote(this.note().id);
  }

  private handleDoubleClick() {
    this.startEditing();
  }

  public startEditing() {
    this.editing.set(true);
    setTimeout(() => {
      this.selectTitle(this.titleBox()?.nativeElement);
    });
  }

  public stopEditing(updatedTitle: string) {
    this.editing.set(false);
    this.updateTitle(this.note(), updatedTitle);
  }

  private updateTitle(note: Note, updatedTitle: string) {
    this.noteStore.updateNote({
      ...note,
      title: updatedTitle,
    });
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
