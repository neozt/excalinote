import { Component, signal, viewChildren } from '@angular/core';
import { NoteTitleListItem } from "@features/dashboard/components/note-title-list-item/note-title-list-item.component";
import { NewNoteButton } from "../new-note-button/new-note-button";
import { Note } from "@shared/models/note.model";
import { v7 as uuidv7 } from "uuid";

@Component({
    selector: 'app-dashboard-sidebar',
    host: {
        class: 'w-[200px] bg-[#e4d3b2] p-5 shadow-[2px_0_10px_rgba(0,0,0,0.1)] overflow-y-auto flex flex-col'
    },
    imports: [
        NoteTitleListItem,
        NewNoteButton
    ],
    templateUrl: './dashboard-sidebar.component.html',
    styleUrl: './dashboard-sidebar.component.less'
})
export class DashboardSidebar {

    notes = signal<Note[]>([])

    noteTitleListItems = viewChildren(NoteTitleListItem)

    debug($event: string) {
        console.log("$event", $event);
    }

    createNote() {
        const newNote: Note = {
            id: uuidv7(),
            title: 'Untitled Note',
            content: '',
        };
        this.notes.update(notes => [newNote, ...notes]);
        setTimeout(() => {
            // Immediately focus newly added note
            this.noteTitleListItems()[0]?.startEditing();
        });
    }
}
