import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from "@angular/core";
import { Note } from "@shared/models/note.model";
import { v7 as uuidv7 } from "uuid";
import { Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export type SyncEvent = "success";

@Injectable({
  providedIn: "root",
})
export class NoteStore {
  private _notes!: WritableSignal<Note[]>;
  notes!: Signal<Note[]>;

  private _selectedNoteId!: WritableSignal<string>;
  selectedNote!: Signal<Note>;

  private localSyncEvent = new Subject<SyncEvent>();

  private readonly STORAGE_KEYS = {
    NOTES: "excalinote_notes_v1",
    LAST_OPENED: "excalinote_last_note_v1",
  };

  constructor() {
    this.initNoteStore();

    effect(() => this.syncNotesToLocalStorage(this.notes()));
    effect(() => this.syncLastOpenedToLocalStorage(this._selectedNoteId()));

    this.initDebuggerLogs();
  }

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

  private initNoteStore() {
    // Initial notes signals
    const savedNotesRaw = localStorage.getItem(this.STORAGE_KEYS.NOTES);
    const savedNotes = (
      savedNotesRaw ? JSON.parse(savedNotesRaw) : []
    ) as Note[];
    const haveSavedNotes = savedNotes.length > 0;
    const initialNotes = haveSavedNotes ? savedNotes : [this.createEmptyNote()];
    if (haveSavedNotes) {
      console.debug("[Local sync] Restoring saved notes", savedNotes);
    } else {
      console.debug("[Local sync] Initialising notes", savedNotes);
    }
    this._notes = signal(initialNotes);
    this.notes = this._notes.asReadonly();

    // Initial selected note signals
    const lastOpenedNote = localStorage.getItem(this.STORAGE_KEYS.LAST_OPENED);
    const isLastOpenValid = initialNotes.some(
      (note) => note.id === lastOpenedNote,
    );
    const initialNote = isLastOpenValid ? lastOpenedNote! : initialNotes[0].id;
    if (isLastOpenValid) {
      console.debug("[Local sync] Restoring last opened note:", lastOpenedNote);
    }
    this._selectedNoteId = signal(initialNote);
    this.selectedNote = computed(() => {
      return this.notes().find((note) => note.id === this._selectedNoteId())!;
    });
  }

  private syncNotesToLocalStorage(notes: Note[]) {
    console.debug("[Local sync] saving notes");
    localStorage.setItem(this.STORAGE_KEYS.NOTES, JSON.stringify(notes));
    this.localSyncEvent.next("success");
  }

  private syncLastOpenedToLocalStorage(noteId: string) {
    console.debug("[Local sync] saving last opened note", noteId);
    localStorage.setItem(this.STORAGE_KEYS.LAST_OPENED, noteId);
  }

  private initDebuggerLogs() {
    effect(() => console.debug("notes updated", this._notes()));
    effect(() => console.debug("new note selected", this._selectedNoteId()));
    effect(() => console.debug("selected note updated", this.selectedNote()));
    this.localSyncEvent.pipe(takeUntilDestroyed()).subscribe((event) => {
      console.debug(`Local sync event: ${event}`);
    });
  }
}
