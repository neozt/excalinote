import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NoteStore } from "@features/dashboard/services/note.store";

type NotebookMode = "read" | "write";

@Component({
  selector: "app-dashboard-main",
  imports: [],
  templateUrl: "./dashboard-main.component.html",
  styleUrl: "./dashboard-main.component.less",
})
export class DashboardMain {
  content = linkedSignal(() => this.noteStore.selectedNote().content);
  contentChange = output<String>();

  noteStore = inject(NoteStore);

  readWrapper = viewChild<ElementRef>("readWrapper");
  readPaper = viewChild<ElementRef>("readPaper");

  mode = signal<NotebookMode>("write");
  currentPage = signal(1);
  maxPage = signal(1);
  readOffset = computed(() => {
    const clientHeight = this.readWrapper()?.nativeElement?.clientHeight ?? 1;
    return (this.currentPage() - 1) * clientHeight;
  });

  toggleMode() {
    const nextMode = this.mode() === "write" ? "read" : "write";
    this.mode.set(nextMode);

    if (nextMode === "read") {
      setTimeout(this.recalculatePagination());
    }
  }

  private recalculatePagination() {
    return () => {
      const visibleHeight =
        this.readWrapper()?.nativeElement?.clientHeight ?? 1;
      const totalHeight = this.readPaper()?.nativeElement?.scrollHeight ?? 0;
      const maxPage = Math.ceil(totalHeight / visibleHeight);
      console.log({
        visibleHeight,
        totalHeight,
        maxPage,
      });
      if (this.currentPage() > maxPage) {
        this.currentPage.set(maxPage);
      }
      this.maxPage.set(maxPage);
    };
  }

  onContentChange(content: string | null) {
    console.log("content", content);
    this.content.set(content ?? "");
  }

  previousPage() {
    if (this.currentPage() === 1) {
      return;
    }

    this.currentPage.update((current) => current - 1);
  }

  nextPage() {
    if (this.currentPage() === this.maxPage()) {
      return;
    }

    this.currentPage.update((current) => current + 1);
  }

  debug($event: UIEvent) {
    console.log("$event", $event);
  }
}
