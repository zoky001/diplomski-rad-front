import { Component } from '@angular/core';

@Component({
  selector: 'app-generic-error',
  template: `
<div class="container-1600" id="2Div">
  <div class="row">

    <div class="col-xs-12 col-sm-12">

      <mat-card class="m-4-t full-width" id="client-list">
          <div style="padding-top:50px;padding-bottom:50px">
              <h2 style="text-align:center;color:red;font-size: x-large;">Došlo je do greške u radu aplikacije. Molimo pokušajte ponovno.</h2>
          </div>
      </mat-card>
    </div>
  </div>
</div>
`

})
export class GenericErrorComponent {


}


