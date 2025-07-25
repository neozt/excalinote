import { computed, Injectable, signal } from "@angular/core";
import { Note } from "@shared/models/note.model";
import { v7 as uuidv7 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class NoteStore {
  private _notes = signal<Note[]>([this.emptyNote()]);
  notes = this._notes.asReadonly();

  private _selectedNoteId = signal<string>(this.notes()[0].id);
  selectedNote = computed(() => {
    return this.notes().find((note) => note.id === this._selectedNoteId())!;
  });

  addNote(note: Note) {
    this._notes.update((notes) => [note, ...notes]);
  }

  emptyNote(): Note {
    return {
      id: uuidv7(),
      title: "Untitled Note",
      content: "",
    };
  }

  updateNote(updatedNote: Note) {
    this._notes.update((notes) => {
      return notes.map((note) => {
        if (note.id === updatedNote.id) {
          return updatedNote;
        }
        return note;
      });
    });
  }
}
