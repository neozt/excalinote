import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from "@angular/core";
import { NoteStore } from "@features/dashboard/services/note.store";
import { NgxResizeObserverDirective } from "ngx-resize-observer";

type NotebookMode = "read" | "write";

@Component({
  selector: "app-dashboard-main",
  imports: [NgxResizeObserverDirective],
  templateUrl: "./dashboard-main.component.html",
  styleUrl: "./dashboard-main.component.less",
})
export class DashboardMain {
  noteStore = inject(NoteStore);

  selectedNote = this.noteStore.selectedNote;
  content = linkedSignal(() => this.noteStore.selectedNote().content);

  readViewHeight = signal(0);
  readTotalHeight = signal(0);
  maxPage = computed(() => {
    return Math.ceil(this.readTotalHeight() / this.readViewHeight());
  });
  currentPage = signal(1);
  currentPageCapped = computed(() => {
    if (this.currentPage() > this.maxPage()) {
      return this.maxPage();
    }
    return this.currentPage();
  });
  readOffset = computed(() => {
    return (this.currentPageCapped() - 1) * this.readViewHeight();
  });

  mode = signal<NotebookMode>("write");

  toggleMode() {
    const nextMode = this.mode() === "write" ? "read" : "write";
    this.mode.set(nextMode);
  }

  onContentChange(content: string | null) {
    this.noteStore.updateNote({
      ...this.selectedNote(),
      content: content ?? "",
    });
  }

  previousPage() {
    this.goToPage(this.currentPageCapped() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPageCapped() + 1);
  }

  goToPage(pageNumber: number) {
    if (pageNumber <= 0 || pageNumber > this.maxPage()) {
      return;
    }

    this.currentPage.set(pageNumber);
  }

  handleTab($event: any) {
    $event.preventDefault();
    this.insertTabAt(window.getSelection());
  }

  private insertTabAt(selection: Selection | null) {
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    // Delete highlighted text
    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Insert tab
    const tabNode = document.createTextNode("\t");
    range.insertNode(tabNode);

    // Move the cursor after the inserted tab
    range.setStartAfter(tabNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }
}
