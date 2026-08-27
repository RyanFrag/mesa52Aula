import { Component } from '@angular/core';
import { BaralhoService } from '../services/baralho.service'
import { Baralho } from '../models/baralho'
import { CommonModule, JsonPipe } from '@angular/common'
import { Carta } from '../models/carta';
import { IonicModule, ToastController} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ValorPipePipe } from '../pipes/valor-pipe-pipe';
import { NaipePipePipe } from '../pipes/naipe-pipe-pipe';
import { CorNaipe } from '../diretiva/cor-naipe';
import { CardComponentComponent } from '../card-component/card-component.component';
import { ModalController, RefresherCustomEvent } from '@ionic/angular/standalone';
import { CardModalComponent } from '../modal/card-modal/card-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, ValorPipePipe, NaipePipePipe, CorNaipe, CardComponentComponent],
})
export class HomePage {
  baralho: Baralho = new Baralho();
  cartas?: Carta[] = []
  cartasRestantes?: number = 0;
  quantidade: number = 1;

  cartaSelecionada?: Carta = undefined;


  constructor(private baralhoService: BaralhoService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}


  ngOnInit(){
   this.novoBaralho()
  }

  novoBaralho(){
     this.baralhoService.criarBaralho().subscribe({
      next: (resposta) => {
        // esperar o valor quando chegar corretamente
        this.baralho = resposta
        this.cartasRestantes = this.baralho.remaining
        this.mostrarAlerta("Baralho comprado com sucesso")
      },
      error: (err) => {
        // se der erro na api
        this.mostrarAlerta("Erro ao comprar ao comprar Baralho")
      }
    })
  }

  comprarCartas(){
    this.baralhoService.comprarCartas(this.baralho.deck_id, this.quantidade).subscribe({
      next: (resposta) =>{
        this.cartas = [...this.cartas, ...resposta!.cards ?? []]
        this.cartasRestantes = resposta!.remaining
        this.mostrarAlerta("Cartas compradas")
      },

      error: (error) => {
        this.mostrarAlerta("Erro ao comprar a carta")
      }
    })
  }

  selecionarCarta(carta: Carta){
    const modal = this.modalController.create({
      component: CardModalComponent,
      componentProps: {
        cartaSelecionada: carta
      }
    })
    modal.then(m => m.present())
  }

  atualizarCarta(event: RefresherCustomEvent){
    this.baralhoService.comprarCartas(this.baralho.deck_id, this.quantidade).subscribe({
      next: (resposta) =>{
        this.cartas = [...this.cartas, ...resposta!.cards ?? []]
        this.cartasRestantes = resposta!.remaining
        event.target.complete();
        this.mostrarAlerta("Cartas atualizadas")
      },
      error: (error) => {
        this.mostrarAlerta("Erro ao comprar a carta")
        event.target.complete()
      }
    })


  }

  mostrarAlerta(mensagem: string){
   this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom'
    }).then(t => t.present())
  }
}
