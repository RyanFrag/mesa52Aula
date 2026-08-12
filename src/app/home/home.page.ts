import { Component } from '@angular/core';
import { BaralhoService } from '../services/baralho.service'
import { Baralho } from '../models/baralho'
import { CommonModule, JsonPipe } from '@angular/common'
import { Carta } from '../models/carta';
import { IonicModule} from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class HomePage {
  baralho: Baralho = new Baralho();
  cartas?: Carta[] = []
  cartasRestantes?: number = 0;
  quantidade: number = 1
  constructor(private baralhoService: BaralhoService) {}
  ngOnInit(){
   this.novoBaralho()
  }

  novoBaralho(){
     this.baralhoService.criarBaralho().subscribe({
      next: (resposta) => {
        // esperar o valor quando chegar corretamente
        this.baralho = resposta
        this.cartasRestantes = this.baralho.remaining
      },
      error: (err) => {
        // se der erro na api
        alert("Erro, não foi possivel obter o baralho")
      }
    })
  }

  comprarCartas(){
    // se não deck_id WOW não tem baralho, sai da função
    if(!this.baralho.deck_id || !this.baralho){
      alert("Erro, sem id do baralho")
      return;
    }
    this.baralhoService.comprarCartas(this.baralho.deck_id, this.quantidade).subscribe({
      next: (resposta) =>{
        this.cartas = resposta!.cards ?? []
        this.cartasRestantes = resposta!.remaining
      },
      error: (error) => {
        alert("Erro ao comprar a carta")
      }
    })
  }

}
