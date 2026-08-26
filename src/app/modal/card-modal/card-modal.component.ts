import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CorNaipe } from 'src/app/diretiva/cor-naipe';
import { Carta } from 'src/app/models/carta';
import { NaipePipePipe } from 'src/app/pipes/naipe-pipe-pipe';
import { ValorPipePipe } from 'src/app/pipes/valor-pipe-pipe';

@Component({
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  imports: [IonicModule, CommonModule, CorNaipe, ValorPipePipe, NaipePipePipe],
})
export class CardModalComponent  implements OnInit {
  @Input() cartaSelecionada: Carta;
  constructor() { }

  ngOnInit() {}

}
