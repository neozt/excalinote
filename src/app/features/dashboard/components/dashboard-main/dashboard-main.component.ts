import {
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { NoteStore } from "@features/dashboard/services/note.store";
import { NgxResizeObserverDirective } from "ngx-resize-observer";
import { NgStyle } from "@angular/common";
import { PageIndicator } from "@features/dashboard/components/page-indicator/page-indicator";

type NotebookMode = "read" | "write";

@Component({
  selector: "app-dashboard-main",
  imports: [NgxResizeObserverDirective, NgStyle, PageIndicator],
  templateUrl: "./dashboard-main.component.html",
  styleUrl: "./dashboard-main.component.css",
})
export class DashboardMain implements OnInit {
  noteStore = inject(NoteStore);

  selectedNote = this.noteStore.selectedNote;

  mode = signal<NotebookMode>("write");

  editorHeight = signal(0);
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

  readonly BORDER_WIDTH = 1;
  readonly LINE_HEIGHT = 32;

  ngOnInit() {
    this.calculateEditorHeight();
  }

  @HostListener("window:resize")
  onWindowResize() {
    this.calculateEditorHeight();
  }

  toggleMode() {
    const nextMode = this.mode() === "write" ? "read" : "write";
    this.mode.set(nextMode);
  }

  onContentChange(content: string | null) {
    this.noteStore.updateNote({
      ...this.selectedNote()!,
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

  private calculateEditorHeight() {
    const windowHeight = window.innerHeight;
    const maxLines = Math.floor((0.8 * windowHeight) / this.LINE_HEIGHT);
    const editorHeight = maxLines * this.LINE_HEIGHT + this.BORDER_WIDTH * 2;
    this.editorHeight.set(editorHeight);
  }
}
