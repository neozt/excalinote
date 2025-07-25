import { computed, effect, Injectable, signal } from "@angular/core";
import { Note } from "@shared/models/note.model";
import { v7 as uuidv7 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class NoteStore {
  private _notes = signal<Note[]>([this.createEmptyNote()]);
  notes = this._notes.asReadonly();

  private _selectedNoteId = signal<string>(this._notes()[0].id);
  selectedNote = computed(() => {
    return this.notes().find((note) => note.id === this._selectedNoteId())!;
  });

  spyNotes = effect(() => console.log("notes updated", this._notes()));
  spySelectedNoteId = effect(() =>
    console.log("new note selected", this._selectedNoteId()),
  );
  spySelectedNote = effect(() =>
    console.log("selected note updated", this.selectedNote()),
  );

  selectNote(noteId: string) {
    if (!this._notes().some((note) => note.id === noteId)) {
      console.error(`Cannot select note: ${noteId}. No such note exists.`);
      return;
    }
    this._selectedNoteId.set(noteId);
  }

  addNote(note: Note) {
    this._notes.update((notes) => [note, ...notes]);
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

  createEmptyNote(): Note {
    return {
      id: uuidv7(),
      title: "Untitled Note",
      content: "",
    };
  }
}
