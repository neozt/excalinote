import { Component, inject, viewChildren } from "@angular/core";
import { NoteTitleListItem } from "@features/dashboard/components/note-title-list-item/note-title-list-item.component";
import { NewNoteButton } from "../new-note-button/new-note-button";
import { Note } from "@shared/models/note.model";
import { NoteStore } from "@features/dashboard/services/note.store";
import { JsonPipe } from "@angular/common";

@Component({
  selector: "app-dashboard-sidebar",
  host: {
    class:
      "w-[200px] bg-[#e4d3b2] p-5 shadow-[2px_0_10px_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col",
  },
  imports: [NoteTitleListItem, NewNoteButton],
  templateUrl: "./dashboard-sidebar.component.html",
  styleUrl: "./dashboard-sidebar.component.less",
})
export class DashboardSidebar {
  noteStore = inject(NoteStore);

  notes = this.noteStore.notes;

  noteTitleListItems = viewChildren(NoteTitleListItem);

  createNote() {
    const newNote = this.noteStore.emptyNote();
    this.noteStore.addNote(newNote);
    setTimeout(() => {
      // Immediately focus newly added note
      this.noteTitleListItems()[0]?.startEditing();
    });
  }

  updateTitle(note: Note, updatedTitle: string) {
    this.noteStore.updateNote({
      ...note,
      title: updatedTitle,
    });
  }
}
