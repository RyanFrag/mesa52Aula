import { Component } from '@angular/core';
import { BaralhoService } from '../services/baralho.service'
import { Baralho } from '../models/baralho'
import { CommonModule } from '@angular/common'
import { Carta } from '../models/carta';
import { FormsModule } from '@angular/forms';
import { CardComponentComponent } from '../card-component/card-component.component';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ModalController,
  RefresherCustomEvent,
  ToastController,
} from '@ionic/angular/standalone';
import { CardModalComponent } from '../modal/card-modal/card-modal.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    CardComponentComponent,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader
  ],
})
export class HomePage {
  baralho: Baralho = new Baralho();
  cartas?: Carta[] = []
  cartasRestantes?: number = 0;
  quantidade: number = 1;

  cartaSelecionada?: Carta = undefined;
  fotoMesa: string;
  latitude: number;
  longitude: number;
  precisao: number;

  constructor(private baralhoService: BaralhoService,
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router,
    private auth: AuthService
  ) {}


  ngOnInit(){
   this.novoBaralho();
   this.buscarUsuarioAtual();
  }

  nomeUsuario: string;
  fotoPerfil: string;
  buscarUsuarioAtual(){
    this.auth.usuarioAtual().subscribe({
      next: (resposta) => {
        this.nomeUsuario = resposta.displayName
        this.fotoPerfil = resposta.photoURL
      }
    })
  }

  novoBaralho(){
     this.baralhoService.criarBaralho().subscribe({
      next: (resposta) => {
        // esperar o valor quando chegar corretamente
        this.baralho = resposta
        this.cartasRestantes = this.baralho.remaining
        this.cartas = []
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

  logout(){
    this.auth.logout().then(() => {
      this.router.navigate(['login'])
    })
  }

  async tirarFoto(){
    try {
      const resultado = await Camera.takePhoto({
        quality: 80,
        saveToGallery: false,
      })

      if (resultado.webPath) {
        this.fotoMesa = resultado.webPath;
      }
    } catch (error) {
      console.error(error)
    }
  }

  async escolherDaGaleria(){
    try {
      const escolha = await Camera.chooseFromGallery({
        quality: 80,
        allowMultipleSelection: false
      })
      const foto = escolha.results[0]
      if(foto.webPath){
        this.fotoMesa = foto.webPath
      }
    }catch (error) {
      console.error(error)
    }
  }


  async obterLocalizacao(): Promise<void>{
    try {
      try{
          const permissao = await Geolocation.checkPermissions();
          if(permissao.location !== 'granted'){
            await Geolocation.requestPermissions();
          }
      }catch (error) {
      console.error(error)
    }
    const posicao = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000
    });
    this.latitude = posicao.coords.latitude;
    this.longitude = posicao.coords.longitude;
    this.precisao = posicao.coords.accuracy;
  } catch (error) {
      console.error(error)
    }
  }


}
