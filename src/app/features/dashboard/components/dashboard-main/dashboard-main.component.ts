import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  linkedSignal,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { NoteStore } from "@features/dashboard/services/note.store";
import { NgxResizeObserverDirective } from "ngx-resize-observer";
import { NgStyle } from "@angular/common";
import { PageIndicator } from "@features/dashboard/components/page-indicator/page-indicator";
import { ShortcutId, ShortcutService } from "@core/shortcut.service";

type NotebookMode = "read" | "write";

@Component({
  selector: "app-dashboard-main",
  imports: [NgxResizeObserverDirective, NgStyle, PageIndicator],
  templateUrl: "./dashboard-main.component.html",
  styleUrl: "./dashboard-main.component.css",
})
export class DashboardMain implements OnInit, OnDestroy {
  noteStore = inject(NoteStore);
  shortcutService = inject(ShortcutService);

  writerRef = viewChild<ElementRef<HTMLDivElement>>("writer");

  selectedNote = this.noteStore.selectedNote;
  selectedNoteId = this.noteStore.selectedNoteId;
  content = linkedSignal(() => {
    // Separate out DOM state from store state to prevent DOM element being re-rendered from its own changes.
    // This is so that ctrl+s doesn't cause us to lose focus from the editor
    const dependencies = [this.selectedNoteId()];
    return untracked(() => this.selectedNote().content);
  });

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

  private shortcutSubscriptions: ShortcutId[] = [];

  readonly BORDER_WIDTH = 1;
  readonly LINE_HEIGHT = 32;

  constructor() {}

  ngOnInit() {
    this.initShortcutListeners();
    this.calculateEditorHeight();
  }

  ngOnDestroy() {
    this.shortcutSubscriptions.forEach((subscription) =>
      this.shortcutService.unregister(subscription),
    );
  }

  @HostListener("window:resize")
  onWindowResize() {
    this.calculateEditorHeight();
  }

  toggleMode() {
    const nextMode = this.mode() === "write" ? "read" : "write";
    this.mode.set(nextMode);
  }

  saveContent(content: string) {
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
    if (this.mode() !== "read") {
      return;
    }

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

  private initShortcutListeners() {
    this.shortcutSubscriptions.push(
      this.shortcutService.register(["PageUp", "ArrowLeft"], () =>
        this.previousPage(),
      ),
      this.shortcutService.register(["PageDown", "ArrowRight"], () =>
        this.nextPage(),
      ),
      this.shortcutService.register([{ key: "s", ctrl: true }], (event) => {
        event.preventDefault();
        this.saveContent(this.writerRef()?.nativeElement?.innerText || "");
      }),
    );
  }

  private calculateEditorHeight() {
    const windowHeight = window.innerHeight;
    const maxLines = Math.floor((0.8 * windowHeight) / this.LINE_HEIGHT);
    const editorHeight = maxLines * this.LINE_HEIGHT + this.BORDER_WIDTH * 2;
    this.editorHeight.set(editorHeight);
  }
}
