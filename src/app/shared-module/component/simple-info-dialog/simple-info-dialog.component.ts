import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-simple-info-dialog',
  templateUrl: 'simple-info-dialog.component.html',
})
export class SimpleInfoDialogComponent {
    title = 'Obavijest';
    content = '';

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        if (!!data.title) {
            this.title = data.title;
        }

        this.content = data.content;
    }
}
