import { Component, effect, inject, OnDestroy } from "@angular/core";
import { DashboardSidebar } from "@features/dashboard/components/dashboard-sidebar/dashboard-sidebar.component";
import { DashboardMain } from "@features/dashboard/components/dashboard-main/dashboard-main.component";
import { Title } from "@angular/platform-browser";
import { NoteStore } from "@features/dashboard/services/note.store";

@Component({
  selector: "app-dashboard",
  imports: [DashboardSidebar, DashboardMain],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.less",
})
export class Dashboard implements OnDestroy {
  titleService = inject(Title);
  noteStore = inject(NoteStore);

  private readonly initialTitle: string;

  constructor() {
    this.initialTitle = this.titleService.getTitle() || "Excalinote";
    effect(() => {
      this.titleService.setTitle(
        this.noteStore.selectedNote()?.title || "Excalinote",
      );
    });
  }

  ngOnDestroy() {
    this.titleService.setTitle(this.initialTitle);
  }
}
