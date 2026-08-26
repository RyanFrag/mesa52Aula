import { openOutline } from 'ionicons/icons';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Carta } from '../models/carta';
import { CommonModule, JsonPipe } from '@angular/common'
import { IonicModule } from '@ionic/angular';
import { ValorPipePipe } from '../pipes/valor-pipe-pipe';
import { NaipePipePipe } from '../pipes/naipe-pipe-pipe';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-card-component',
  templateUrl: './card-component.component.html',
  styleUrls: ['./card-component.component.scss'],
  imports: [CommonModule, IonicModule, ValorPipePipe, NaipePipePipe],
})
export class CardComponentComponent  implements OnInit {

  @Input() carta?: Carta;
  @Output() selecionar = new EventEmitter<Carta>();
  constructor() {
    addIcons({
      'open': openOutline,
      'open-outline': openOutline
    })
   }

  ngOnInit() {}

  selecionarCarta(carta: Carta){
    this.selecionar.emit(carta)
  }

}
