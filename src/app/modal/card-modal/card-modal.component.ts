import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { CorNaipe } from 'src/app/diretiva/cor-naipe';
import { Carta } from 'src/app/models/carta';
import { NaipePipePipe } from 'src/app/pipes/naipe-pipe-pipe';
import { ValorPipePipe } from 'src/app/pipes/valor-pipe-pipe';

@Component({
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    CorNaipe,
    ValorPipePipe,
    NaipePipePipe,
  ],
})
export class CardModalComponent  implements OnInit {
  @Input() cartaSelecionada: Carta;
  constructor(private modalController: ModalController) { }
  ngOnInit() {}
  fechar(){
    this.modalController.dismiss()
  }
}
