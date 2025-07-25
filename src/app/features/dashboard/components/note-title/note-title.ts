import { Component, ElementRef, HostListener, input, linkedSignal, output, signal, viewChild } from '@angular/core';

@Component({
    selector: 'app-note-title',
    imports: [],
    host: {},
    templateUrl: './note-title.html',
    styleUrl: './note-title.css'
})
export class NoteTitle {

    value = input.required<string>();
    valueChange = output<string>();

    _currentValue = linkedSignal(() => this.value());

    _editing = signal(false);

    _titleBox = viewChild<ElementRef>('titleBox');

    startEditing() {
        console.log('start edit')
        this._editing.set(true);
        setTimeout(() => {
            this.selectTitle(this._titleBox()?.nativeElement);
        });
    }

    stopEditing() {
        console.log('stop edit')
        this._editing.set(false);
        this.valueChange.emit(this._currentValue());
    }

    @HostListener('document:click', ['$event'])
    onOutsideClick(event: MouseEvent): void {
        if (!this._editing()) {
            return;
        }

        const clickedInside = this._titleBox()?.nativeElement?.contains(event.target as Node);
        if (!clickedInside) {
            this.stopEditing();
        }
    }

    private selectTitle(el: HTMLElement) {
        if (!el) {
            return;
        }
        el.focus();

        const range = document.createRange();
        range.selectNodeContents(el);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
}
