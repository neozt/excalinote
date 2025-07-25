import { Injectable, signal } from "@angular/core";
import { Note } from "@shared/models/note.model";
import { v7 as uuidv7 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class NoteStore {
  private _notes = signal<Note[]>([createEmptyNote()]);
  notes = this._notes.asReadonly();

  private _selectedNote = signal<Note>(this._notes()[0]);
  selectedNote = this._selectedNote.asReadonly();
}

function createEmptyNote(): Note {
  return {
    id: uuidv7(),
    title: "Untitled Note",
    content: "",
  };
}
