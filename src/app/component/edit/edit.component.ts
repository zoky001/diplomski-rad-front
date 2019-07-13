import {Component, OnInit} from '@angular/core';


@Component({
  selector: 'app-edit-rispo',
  templateUrl: 'edit.component.html',
  styleUrls: ['edit.component.scss']
})
export class EditComponent implements OnInit {

  ngOnInit(): void {
    setTimeout(() => {
      alert('Ovo je glavna stranica aplikacije i ona je još u izradi. Bit će dostupna u sljedećoj radnoj verziji. \n' +
        'Prikazana je slika izgleda ekrana u staroj aplikaciji.');
    }, 1000);
  }


}
