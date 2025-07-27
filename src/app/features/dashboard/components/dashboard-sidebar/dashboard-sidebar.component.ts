import { Component, inject, viewChildren } from "@angular/core";
import { NoteTitleListItem } from "@features/dashboard/components/note-title-list-item/note-title-list-item.component";
import { NewNoteButtonComponent } from "../new-note-button/new-note-button.component";
import { Note } from "@shared/models/note.model";
import { NoteStore } from "@features/dashboard/services/note.store";

@Component({
  selector: "app-dashboard-sidebar",
  host: {
    class:
      "w-[250px] bg-[#e4d3b2] p-5 shadow-[2px_0_10px_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col",
  },
  imports: [NoteTitleListItem, NewNoteButtonComponent],
  templateUrl: "./dashboard-sidebar.component.html",
  styleUrl: "./dashboard-sidebar.component.css",
})
export class DashboardSidebar {
  noteStore = inject(NoteStore);

  private noteTitleListItems = viewChildren(NoteTitleListItem);

  notes = this.noteStore.notes;

  createNote() {
    const newNote = this.noteStore.createEmptyNote();
    this.noteStore.addNote(newNote);
    setTimeout(() => {
      this.focusNewTitleListItem(newNote);
      this.noteStore.selectNote(newNote.id);
    });
  }

  private focusNewTitleListItem(newNote: Note) {
    const newListItem = this.noteTitleListItems()?.find(
      (listItem) => listItem.note().id === newNote.id,
    );
    if (newListItem) {
      newListItem.startEditing();
    }
  }
}
