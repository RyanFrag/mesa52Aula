import { Component } from '@angular/core';
import { BaralhoService } from '../services/baralho.service'
import { Baralho } from '../models/baralho'
import { CommonModule } from '@angular/common'
import { Carta } from '../models/carta';
import { FormsModule } from '@angular/forms';
import { CardComponentComponent } from '../card-component/card-component.component';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController,
  RefresherCustomEvent,
  ToastController,
} from '@ionic/angular/standalone';
import { CardModalComponent } from '../modal/card-modal/card-modal.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Camera, CameraErrorCode } from '@capacitor/camera';
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    CardComponentComponent,
    IonButtons,
    IonMenuButton
  ],
})
export class HomePage {
  baralho: Baralho = new Baralho();
  cartas?: Carta[] = []
  cartasRestantes?: number = 0;
  quantidade: number = 1;

  cartaSelecionada?: Carta = undefined;

  fotoMesa?: string;
  latitude?: number;
  longitude?: number;
  precisao?: number;
  carregandoLocalizacao = false;
  erroLocalizacao = '';
  erroFoto = '';


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

  async tirarFoto(): Promise<void> {
    this.erroFoto = '';

    try {
      // Abre a câmera nativa do dispositivo e aguarda uma foto.
      const resultado = await Camera.takePhoto({
        quality: 80,
        saveToGallery: false,
      });

      // O webPath pode ser usado diretamente como src da imagem.
      if (resultado.webPath) {
        this.fotoMesa = resultado.webPath;
      }
    } catch (erro) {
      if (this.fotoFoiCancelada(erro)) {
        return;
      }

      console.error('Erro ao tirar foto:', erro);
      this.erroFoto = this.mensagemFoto(erro);
    }
  }

  async escolherDaGaleria(): Promise<void> {
    this.erroFoto = '';

    try {
      // chooseFromGallery abre a galeria. Aqui só uma imagem é permitida.
      const escolha = await Camera.chooseFromGallery({
        quality: 80,
        allowMultipleSelection: false,
      });

      const foto = escolha.results[0];

      // O webPath pode ser usado diretamente como src da imagem.
      if (foto?.webPath) {
        this.fotoMesa = foto.webPath;
      }
    } catch (erro) {
      if (this.fotoFoiCancelada(erro)) {
        return;
      }

      console.error('Erro ao escolher foto:', erro);
      this.erroFoto = this.mensagemFoto(erro);
    }
  }

  async obterLocalizacao(): Promise<void> {
    this.erroLocalizacao = '';
    this.carregandoLocalizacao = true;

    try {
      // No celular, estas chamadas consultam e pedem a permissão.
      // No navegador, requestPermissions não existe: o aviso aparece no getCurrentPosition.
      try {
        const permissao = await Geolocation.checkPermissions();
        if (permissao.location !== 'granted') {
          const pedido = await Geolocation.requestPermissions();
          if (pedido.location !== 'granted') {
            this.erroLocalizacao = 'Permissão de localização negada.';
            return;
          }
        }
      } catch (erroPermissao) {
        // No navegador, requestPermissions não existe.
        // O aviso aparece no getCurrentPosition.
        console.error('Permissão de localização:', erroPermissao);
      }

      // O GPS fino demora em sala fechada.
      // Se estourar o tempo, lerPosicao pede a localização da rede.
      const posicao = await this.lerPosicao();

      // As coordenadas ficam dentro de coords.
      this.latitude = posicao.coords.latitude;
      this.longitude = posicao.coords.longitude;
      // A precisão é informada em metros.
      this.precisao = posicao.coords.accuracy;
    } catch (erro) {
      console.error('Erro ao obter localização:', erro);
      this.erroLocalizacao = this.mensagemLocalizacao(erro);
    } finally {
      this.carregandoLocalizacao = false;
    }
  }

  async lerPosicao() {
    try {
      // Solicita ao dispositivo a posição GPS atual.
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
      });
    } catch (erroGps) {
      const texto = String((erroGps as { message?: string }).message ?? '').toLowerCase();
      const codigo = String((erroGps as { code?: string | number }).code ?? '');
      const estourouTempo = codigo.includes('0010')
        || texto.includes('timeout')
        || texto.includes('in time');

      if (!estourouTempo) {
        throw erroGps;
      }

      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 20000,
      });
    }
  }

  // Montamos uma URL usando latitude e longitude
  // para visualizar a posição em um serviço de mapas.
  urlMapa(): string {
    return `https://www.openstreetmap.org/?mlat=${this.latitude}&mlon=${this.longitude}#map=16/${this.latitude}/${this.longitude}`;
  }

  fotoFoiCancelada(erro: unknown): boolean {
    const codigo = (erro as { code?: string }).code;
    const texto = String((erro as { message?: string }).message ?? '').toLowerCase();

    return codigo === CameraErrorCode.TakePhotoCancelled
      || codigo === CameraErrorCode.ChooseMediaCancelled
      || texto.includes('cancel');
  }

  mensagemFoto(erro: unknown): string {
    const codigo = (erro as { code?: string }).code;

    if (codigo === CameraErrorCode.NoCameraAvailable) {
      return 'A câmera não está disponível neste aparelho.';
    }

    if (
      codigo === CameraErrorCode.CameraPermissionDenied
      || codigo === CameraErrorCode.GalleryPermissionDenied
    ) {
      return 'Permissão para usar a câmera ou a galeria foi negada.';
    }

    return 'Não foi possível obter a foto.';
  }

  mensagemLocalizacao(erro: unknown): string {
    const codigo = (erro as { code?: number | string }).code;
    const codigoTexto = String(codigo ?? '');
    const texto = String((erro as { message?: string }).message ?? '').toLowerCase();

    if (codigoTexto.includes('0018') || texto.includes('not declared')) {
      return 'Falta a permissão de localização no AndroidManifest. Gere o APK de novo depois de salvar o manifesto.';
    }

    if (codigo === 1 || codigoTexto.includes('0003') || texto.includes('denied') || texto.includes('permiss')) {
      return 'Permissão de localização negada.';
    }

    if (codigo === 3 || codigoTexto.includes('0010') || texto.includes('timeout') || texto.includes('in time')) {
      return 'A localização demorou demais. Ligue o GPS e tente de novo.';
    }

    if (
      codigo === 2
      || codigoTexto.includes('0007')
      || codigoTexto.includes('0016')
      || codigoTexto.includes('0017')
      || texto.includes('disabled')
      || texto.includes('not enabled')
      || texto.includes('turned off')
      || texto.includes('unavailable')
    ) {
      return 'A localização do aparelho parece desativada.';
    }

    return 'Não foi possível obter sua localização.';
  }
}
