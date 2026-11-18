# Aula: Câmera, Galeria, Geolocalização e Mapa

Projeto: Mesa 52 (`https://github.com/RyanFrag/mesa52Aula`).

Ionic 8, Angular 20 e Capacitor 8. A Home continua comprando cartas. Esta aula só acrescenta o registro da partida.

O foco é o celular. O navegador serve para mostrar a ideia, e o comportamento dele é diferente do APK.

## Antes de começar

O Mesa 52 já tinha, antes desta aula:

- a API pública Deck of Cards, em `BaralhoService`;
- compra de cartas, novo baralho e seleção de quantidade;
- o componente `app-card-component`, com `@Input() carta` e `@Output() selecionar`;
- os pipes `naipePipe` e `valorPipe`;
- a diretiva `appCorNaipe`;
- login, cadastro e a Home protegida pelo guard;
- Capacitor 8 configurado em `capacitor.config.ts` (`appId` `io.ionic.starter`, `webDir` `www`).

Nesta cópia da aula **não existe a pasta `android/`**. O projeto web está pronto para o Capacitor, e o projeto nativo ainda não foi gerado. As permissões do Android entram depois de `npx cap add android`.

`node -v` precisa ser 20.19 ou mais novo, ou 22.12 ou mais novo. O Angular 20 não instala no Node 14. Se o terminal mostrar uma versão antiga:

```bash
nvm use 22
node -v
```

O código da Home já importava Firebase, mas o `package.json` do GitHub não listava o pacote `firebase`. Sem ele, o build para em `Cannot find module 'firebase/app'`. Isso não é desta aula. Se o erro aparecer antes da câmera:

```bash
npm install firebase@12
```

Arquivos que esta aula modifica:

- `package.json` e `package-lock.json`
- `src/main.ts`
- `src/app/home/home.page.ts`
- `src/app/home/home.page.html`
- `src/app/home/home.page.scss`

Nada de service novo, banco, upload ou mapa com chave.

## Objetivo

No final da aula o aluno consegue:

- tirar uma foto;
- escolher uma foto da galeria;
- ver o preview na Home;
- obter o GPS atual;
- ver latitude, longitude e precisão;
- abrir essa posição no OpenStreetMap.

A foto e a localização ficam só na memória da página. Fechou o app, perdeu o registro. Isso é de propósito.

## Passo 1: Instalar Camera

No terminal, na raiz do Mesa 52:

```bash
npm install @capacitor/camera@8 @ionic/pwa-elements
npx cap sync
```

O que cada comando faz:

- `npm install @capacitor/camera@8` baixa o plugin oficial da mesma major do Capacitor do projeto (core 8.5.0). O `@8` pede a linha 8, e o npm grava a última 8 disponível.
- `@ionic/pwa-elements` é o visual da câmera quando o app roda no navegador (`ionic serve` ou `npm start`). No celular o Capacitor abre a câmera do Android, e este pacote não substitui isso.
- `npx cap sync` copia o projeto web e avisa os projetos nativos que existe um plugin novo. Sem o sync, o Android continua sem o plugin mesmo depois do `npm install`.

Nesta aula a versão instalada foi `@capacitor/camera@8.2.6` e `@ionic/pwa-elements@3.4.0`.

Confira:

```bash
npm ls @capacitor/camera @ionic/pwa-elements
```

A versão da câmera precisa ser **8.1 ou maior**. `Camera.takePhoto()` e `Camera.chooseFromGallery()` existem a partir da 8.1. A 8.2 ainda traz os códigos de erro (`CameraErrorCode`) usados no tratamento de cancelamento.

Resultado esperado: o `package.json` ganha as duas dependências, e o sync termina sem erro. Se a pasta `android/` ainda não existir, o sync só atualiza a parte web e termina. Isso é normal neste repositório.

### Registrar o PWA Elements

Arquivo: `src/main.ts`

Inclua o import e a chamada **antes** de `bootstrapApplication`:

```ts
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// No navegador, o PWA Elements mostra a câmera durante o ionic serve.
// No celular, o Capacitor usa a câmera nativa e este registro não atrapalha.
defineCustomElements(window);
```

No navegador, com esse registro, Tirar foto abre um modal com a webcam. Sem ele, o plugin cai para o seletor de arquivo do navegador. No APK os dois caminhos usam a câmera do aparelho.

Diga em voz alta: o que funciona no Chrome do laboratório pode ser um modal ou um input de arquivo. A experiência que vale nota é a do celular.

## Passo 2: Importar Camera

Arquivo: `src/app/home/home.page.ts`

Junto dos outros imports:

```ts
import { Camera, CameraErrorCode } from '@capacitor/camera';
```

`Camera` é o plugin. `CameraErrorCode` é o conjunto de códigos que o plugin devolve quando a pessoa cancela, nega a permissão ou o aparelho não tem câmera. Assim a tela distingue cancelamento de erro de verdade.

## Passo 3: Criar fotoMesa

Ainda em `home.page.ts`, junto das propriedades da página:

```ts
fotoMesa?: string;
erroFoto = '';
```

`fotoMesa` é `string | undefined` porque, ao abrir a Home, ainda não existe imagem. `undefined` faz o `*ngIf` mostrar o texto "Nenhuma foto registrada.". Quando a câmera devolve um caminho, a propriedade vira string e o `<img>` aparece.

`erroFoto` guarda um texto curto. Vazio significa que não há erro.

## Passo 4: Implementar tirarFoto()

Cole estes métodos na classe, abaixo de `logout()`.

```ts
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
```

Linha por linha, em `tirarFoto()`:

1. `this.erroFoto = ''` limpa a mensagem da tentativa anterior.
2. `Camera.takePhoto(...)` abre a câmera e espera a pessoa tirar a foto. O `await` segura a função até a foto voltar, ou até a pessoa cancelar.
3. `quality: 80` pede um JPEG razoável, de 0 a 100. 100 deixa a foto pesada para uma aula. 80 chega bem no preview.
4. `saveToGallery: false` não grava uma cópia na galeria do celular. O padrão do plugin já é `false`. Deixar explícito ajuda a explicar por que não pedimos permissão de armazenamento.
5. `resultado.webPath` é um endereço que a tag `<img>` entende. No navegador é um blob. No Android também é um caminho que o WebView consegue mostrar. Não precisa converter para base64.
6. Se a pessoa fecha a câmera sem fotografar, o plugin rejeita a Promise. `fotoFoiCancelada` reconhece o código `TakePhotoCancelled` e, no navegador, a mensagem `User cancelled photos app`. A função dá `return` e a foto antiga permanece.
7. Erro de verdade vai para `console.error`, para você ver o detalhe técnico, e a tela mostra só uma frase curta. A stack não aparece para o aluno.

`fotoFoiCancelada` e `mensagemFoto` também servem para a galeria. Por isso já entram neste passo.

## Passo 5: Criar botão Tirar foto

O `<ion-card>` é componente standalone. Sem ele no `imports` do `@Component`, o Angular não reconhece a tag.

No array `imports` de `HomePage`, acrescente:

```ts
IonCard,
IonCardHeader,
IonCardTitle,
IonCardContent,
```

E no import que já vem de `@ionic/angular/standalone`:

```ts
IonCard,
IonCardContent,
IonCardHeader,
IonCardTitle,
```

Arquivo: `src/app/home/home.page.html`

A seção fica **depois** da lista de cartas e do aviso de baralho acabado, **antes** do botão Sair. O jogo permanece como está.

```html
<ion-card class="registro">
  <ion-card-header>
    <ion-card-title>Registro da partida</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    <p *ngIf="!fotoMesa">Nenhuma foto registrada.</p>
    <p *ngIf="erroFoto">{{ erroFoto }}</p>

    <ion-button expand="block" (click)="tirarFoto()">Tirar foto</ion-button>
  </ion-card-content>
</ion-card>
```

`(click)="tirarFoto()"` chama o método. `expand="block"` só estica o botão na largura do card, no mesmo estilo dos botões que a Home já usa.

Resultado esperado: depois de entrar na Home, o card aparece abaixo das cartas. O clique abre a câmera (no navegador, o modal do PWA Elements ou o seletor de arquivo). A imagem ainda não aparece: isso é o próximo passo. Cancelar volta para a Home sem mensagem vermelha.

## Passo 6: Mostrar preview

Troque o miolo do card para incluir a imagem. O `*ngIf` é o mesmo recurso que a Home já usa nas cartas.

```html
<img *ngIf="fotoMesa" class="foto-mesa" [src]="fotoMesa" alt="Foto da mesa">
<p *ngIf="!fotoMesa">Nenhuma foto registrada.</p>
```

`[src]="fotoMesa"` liga o atributo ao `webPath`. Com foto, o parágrafo some. Sem foto, a imagem some.

Em `src/app/home/home.page.scss`, no final:

```scss
.registro {
  margin-top: 16px;
}

.foto-mesa {
  display: block;
  width: 100%;
  max-height: 240px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}
```

A foto ocupa a largura do card e não estoura a tela.

### CHECKPOINT

O aluno precisa conseguir:

clicar em Tirar foto, abrir a câmera, confirmar a foto e ver a imagem no card.

Tirar outra foto substitui `fotoMesa`. É assim que se troca a foto: o botão continua na tela.

## Passo 7: Galeria

O plugin da câmera já abre a galeria. Não instale outro pacote.

Em `home.page.ts`, abaixo de `tirarFoto()`:

```ts
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
```

Diferença para mostrar no quadro:

| Método | O que abre | O que volta |
| --- | --- | --- |
| `Camera.takePhoto()` | a câmera | um `MediaResult` com `webPath` |
| `Camera.chooseFromGallery()` | a galeria | um `MediaResults`, e a foto está em `results[0]` |

`allowMultipleSelection: false` é o padrão. Deixar escrito deixa claro que a aula é uma imagem só. `results[0]` é essa imagem. `foto?.webPath` evita erro se a lista vier vazia.

No HTML, o segundo botão fica logo abaixo de Tirar foto:

```html
<ion-button expand="block" fill="outline" (click)="escolherDaGaleria()">
  Escolher da galeria
</ion-button>
```

Os dois botões continuam visíveis depois da foto. Clicar de novo troca o preview.

### CHECKPOINT

Câmera e galeria funcionando: cada botão abre o recurso certo, cancelar não apaga a foto anterior, e a imagem escolhida aparece no card.

## Passo 8: Instalar Geolocation

```bash
npm install @capacitor/geolocation@8
npx cap sync
```

Mesma ideia do passo 1. O plugin fica na major 8. Nesta aula chegou `@capacitor/geolocation@8.2.4`.

```bash
npm ls @capacitor/geolocation
```

Import em `home.page.ts`:

```ts
import { Geolocation } from '@capacitor/geolocation';
```

Esta aula pede a posição uma vez. Não use `watchPosition`.

## Passo 9: Configurar permissões

O repositório da aula **ainda não tem** `android/`. Não crie a pasta na mão e não copie um AndroidManifest de outro projeto.

Quando for gerar o APK pela primeira vez:

```bash
npx cap add android
```

Aí o arquivo existe:

`android/app/src/main/AndroidManifest.xml`

Dentro de `<manifest>`, antes de `<application>`, inclua só estas duas linhas, se elas ainda não estiverem lá:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

- `ACCESS_COARSE_LOCATION`: localização aproximada.
- `ACCESS_FINE_LOCATION`: localização mais precisa, a que combina com `enableHighAccuracy: true`.

O manifesto do próprio plugin não declara essas permissões. Se faltarem no manifesto do app, o Android recusa o GPS e a mensagem técnica fala em permissão não declarada.

Câmera: com `saveToGallery: false`, não acrescente `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` nem `READ_MEDIA_IMAGES`. O plugin abre o app de câmera e o seletor da galeria. O manifesto do plugin só declara as `queries` desses aplicativos.

## Passo 10: Criar propriedades

Em `home.page.ts`:

```ts
latitude?: number;
longitude?: number;
precisao?: number;
carregandoLocalizacao = false;
erroLocalizacao = '';
```

`latitude` e `longitude` começam `undefined`. O HTML usa isso para saber se já existe posição. `precisao` vem em metros e também pode não existir. `carregandoLocalizacao` liga o spinner e desliga o botão. `erroLocalizacao` é o texto curto da tela.

## Passo 11: implementar obterLocalizacao()

```ts
async obterLocalizacao(): Promise<void> {
  this.erroLocalizacao = '';
  this.carregandoLocalizacao = true;

  try {
    // No celular, estas chamadas consultam e pedem a permissão.
    // No navegador, requestPermissions não existe: o aviso aparece no getCurrentPosition.
    try {
      const permissao = await Geolocation.checkPermissions();
      if (permissao.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
    } catch (erroPermissao) {
      console.error('Permissão de localização:', erroPermissao);
    }

    // Solicita ao dispositivo a posição GPS atual.
    const posicao = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

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

mensagemLocalizacao(erro: unknown): string {
  const codigo = (erro as { code?: number | string }).code;
  const texto = String((erro as { message?: string }).message ?? '').toLowerCase();

  if (codigo === 1 || texto.includes('denied') || texto.includes('permiss')) {
    return 'Permissão de localização negada.';
  }

  if (codigo === 3 || texto.includes('timeout')) {
    return 'A localização demorou demais. Tente de novo.';
  }

  if (codigo === 2 || texto.includes('disabled') || texto.includes('unavailable')) {
    return 'A localização do aparelho parece desativada.';
  }

  return 'Não foi possível obter sua localização.';
}
```

A ordem para desenhar no quadro:

permissão, `getCurrentPosition`, `coords`, latitude, longitude, precisão.

- `checkPermissions()` pergunta o estado atual.
- `requestPermissions()` abre o diálogo do Android quando ainda não foi concedida. No Chrome essa função não existe e cai no `catch`. O aviso do navegador aparece na linha seguinte.
- `getCurrentPosition` pede uma leitura. `enableHighAccuracy: true` pede o GPS mais fino. `timeout: 10000` espera no máximo 10 segundos.
- `posicao.coords.latitude` e `longitude` são os números. `accuracy` é o raio aproximado, em metros.
- O `finally` desliga o spinner tanto no sucesso quanto no erro. Sem isso o botão fica desabilitado para sempre.
- A tela mostra uma frase. O objeto técnico fica no `console.error`.

### CHECKPOINT

O app mostra coordenadas reais. No navegador, aceite a permissão do site. No celular, aceite a permissão do Android e deixe a localização ligada.

## Passo 12: Mostrar localização no HTML

`IonSpinner` entra no import de `@ionic/angular/standalone` e no array `imports` do componente.

No final de `home.page.scss`:

```scss
.localizacao-carregando {
  display: flex;
  align-items: center;
  gap: 8px;
}

.localizacao-carregando p {
  margin: 0;
}
```

Dentro de `<ion-card-content>`, depois dos botões da foto:

```html
<h3>Localização</h3>

<div class="localizacao-carregando" *ngIf="carregandoLocalizacao">
  <ion-spinner name="crescent"></ion-spinner>
  <p>Obtendo localização...</p>
</div>

<p *ngIf="!carregandoLocalizacao && latitude == null">
  Localização ainda não obtida.
</p>
<p *ngIf="erroLocalizacao">{{ erroLocalizacao }}</p>

<div *ngIf="latitude != null && longitude != null">
  <p>Latitude: {{ latitude | number:'1.4-6' }}</p>
  <p>Longitude: {{ longitude | number:'1.4-6' }}</p>
  <p *ngIf="precisao != null">
    Precisão: aproximadamente {{ precisao | number:'1.0-0' }} metros
  </p>
</div>

<ion-button
  *ngIf="latitude == null"
  expand="block"
  [disabled]="carregandoLocalizacao"
  (click)="obterLocalizacao()">
  Obter localização
</ion-button>
<ion-button
  *ngIf="latitude != null"
  expand="block"
  [disabled]="carregandoLocalizacao"
  (click)="obterLocalizacao()">
  Atualizar localização
</ion-button>
```

`latitude == null` também cobre `undefined`. Use `== null`, porque a latitude `0` é um lugar real e não pode ser tratada como "não tem localização".

O pipe `number` já vem do `CommonModule`, que a Home importa. `'1.4-6'` mostra de 4 a 6 casas decimais. `'1.0-0'` mostra a precisão em metros, sem casas decimais.

Enquanto `carregandoLocalizacao` é true, o spinner aparece e o botão fica desabilitado.

## Passo 13: Criar botão Abrir no mapa

Não instale Google Maps, SDK nem `@capacitor/browser`. A aula só mostra que dois números abrem um mapa.

Em `home.page.ts`:

```ts
// Montamos uma URL usando latitude e longitude
// para visualizar a posição em um serviço de mapas.
urlMapa(): string {
  return `https://www.openstreetmap.org/?mlat=${this.latitude}&mlon=${this.longitude}#map=16/${this.latitude}/${this.longitude}`;
}
```

`mlat` e `mlon` colocam o marcador. `#map=16/latitude/longitude` define o zoom 16 nessa posição. O OpenStreetMap é público e não pede chave.

No HTML, o botão só existe quando os dois números já chegaram:

```html
<ion-button
  *ngIf="latitude != null && longitude != null"
  expand="block"
  fill="outline"
  [href]="urlMapa()"
  target="_blank"
  rel="noopener noreferrer">
  Abrir no mapa
</ion-button>
```

`[href]` monta a URL. `target="_blank"` pede para abrir fora da tela atual. No navegador isso é outra aba. No APK, o WebView costuma entregar o link ao navegador do celular.

O fluxo para fechar a aula:

GPS, latitude/longitude, URL, mapa.

### CHECKPOINT FINAL

Foto no card, coordenadas na tela e o botão Abrir no mapa caindo na posição obtida.

## Passo 14: Build e Android

Sempre que o código web mudar e o APK precisar acompanhar:

```bash
npm run build
npx cap sync android
npx cap open android
```

`npm run build` gera a pasta `www`. O Capacitor não lê `src/` no celular. Ele lê `www`.

`npx cap sync android` copia esse `www` para dentro de `android/` e atualiza os plugins.

`npx cap open android` abre o Android Studio. Lá: Build, Generate App Bundles or APKs.

Se `android/` ainda não existe, a primeira vez é outra:

```bash
npx cap add android
```

Depois confira o `AndroidManifest.xml` do passo 9, e só então rode build, sync e open.

Esqueceu o build ou o sync: o Studio gera um APK com a Home antiga, sem o card novo.

## Teste no celular

- A câmera abre.
- A foto aparece no card.
- A galeria abre.
- A imagem escolhida aparece no lugar da anterior.
- O Android pede permissão de localização.
- Latitude, longitude e precisão aparecem.
- Abrir no mapa cai na mesma região.
- Cancelar a câmera não mostra erro e não apaga a foto que já estava na tela.
- Negar a permissão mostra uma frase curta, sem stack trace.
- Comprar carta, novo baralho e o clique na carta continuam funcionando.

## Erros comuns

### Plugin não encontrado

Sintoma: `Cannot find module '@capacitor/camera'` ou o mesmo para `geolocation`.

Causa: o import foi escrito antes do `npm install`, ou o install foi feito em outra pasta.

Solução: rode o `npm install` na raiz do Mesa 52, onde está o `package.json`, e confira com `npm ls @capacitor/camera`.

### Esqueceu npm install

Sintoma: o TypeScript sublinha `Camera` e `Geolocation`.

Causa: o pacote não está em `node_modules` nem no `package.json`.

Solução: `npm install @capacitor/camera@8` e `npm install @capacitor/geolocation@8`.

### Esqueceu cap sync

Sintoma: no navegador a função existe, no APK o plugin falha com "not implemented" ou o recurso nativo não abre.

Causa: o projeto Android foi gerado ou compilado antes do plugin entrar.

Solução: `npm run build` e `npx cap sync android`. Gere o APK de novo.

### Permissão não declarada

Sintoma: no Android a localização falha e o console fala que `ACCESS_COARSE_LOCATION` não está no manifesto.

Causa: `npx cap add android` já foi feito, e as duas linhas do passo 9 não foram colocadas em `android/app/src/main/AndroidManifest.xml`.

Solução: declare `ACCESS_COARSE_LOCATION` e `ACCESS_FINE_LOCATION`, sincronize e gere o APK outra vez.

### Permissão negada

Sintoma: a tela mostra "Permissão de localização negada." ou "Permissão para usar a câmera ou a galeria foi negada."

Causa: a pessoa recusou o diálogo. O Android não mostra o mesmo diálogo de novo para sempre.

Solução: em Ajustes do aparelho, Apps, Mesa 52, Permissões, libere Câmera e Localização. No Chrome, o cadeado ao lado do endereço também guarda a permissão do site.

### Localização desativada

Sintoma: "A localização do aparelho parece desativada."

Causa: o GPS do sistema está desligado. A permissão do app pode estar certa mesmo assim.

Solução: ligue a localização no painel rápido do Android e toque em Obter localização de novo.

### Timeout

Sintoma: "A localização demorou demais. Tente de novo."

Causa: em 10 segundos o aparelho não conseguiu uma leitura. Comum em laboratório fechado, com `enableHighAccuracy: true`.

Solução: chegar perto de uma janela, ou tocar de novo. Para a demonstração no navegador, o Wi-Fi costuma responder mais rápido que o GPS frio do celular.

### Câmera no celular e no navegador

Sintoma: no `npm start` abre um modal ou um input de arquivo. No APK abre o app de câmera.

Causa: são implementações diferentes do mesmo `Camera.takePhoto()`. O navegador não tem a câmera nativa do Android. O PWA Elements imita a experiência. Sem o `defineCustomElements(window)`, o navegador usa o seletor de arquivo.

Solução: use o navegador para ver o preview e o fluxo. Valide câmera, galeria e GPS no APK. Diga isso antes do teste, para a turma não achar que o código está errado.

### Imagem sem webPath

Sintoma: a função termina e o card continua em "Nenhuma foto registrada.".

Causa: o resultado veio sem `webPath`, ou o `<img>` está com `src="{{ fotoMesa }}"` apontando para outra propriedade.

Solução: confira `this.fotoMesa = resultado.webPath` na câmera e `escolha.results[0]` na galeria. No HTML, `[src]="fotoMesa"`.

### Android desatualizado

Sintoma: o APK abre a Home antiga, sem "Registro da partida".

Causa: o código foi alterado em `src/`, e faltou `npm run build` ou `npx cap sync android` antes de gerar o APK.

Solução: build, sync, abrir o Studio e gerar de novo. O sync copia `www`, não o `src`.

### cap sync pede a pasta www

Sintoma: `Could not find the web assets directory: ./www`.

Causa: ainda não houve `npm run build` nesta máquina.

Solução: `npm run build` e, em seguida, `npx cap sync`.

### Node antigo

Sintoma: `npm install` ou `ng build` reclama da versão do Node.

Causa: o terminal está abaixo de 20.19.

Solução: `nvm use 22` e rode o comando outra vez.

## Conceitos centrais desta aula

O Ionic continua sendo HTML, CSS e TypeScript, mas o Capacitor funciona como uma ponte para recursos nativos do dispositivo.

```
Ionic/TypeScript
      ↓
Plugin Capacitor
      ↓
Sistema operacional
      ↓
Hardware/Recurso nativo
```

Câmera:

```
botão
→ função TypeScript
→ Camera
→ câmera/galeria do aparelho
→ webPath
→ imagem
```

GPS:

```
botão
→ Geolocation
→ sistema operacional
→ GPS/rede
→ coords
→ latitude/longitude
→ mapa
```

`takePhoto()` e `chooseFromGallery()` não leem a câmera em JavaScript puro. Eles pedem ao sistema. `getCurrentPosition()` também não calcula latitude: ele recebe o que o sistema mediu. A URL do mapa é só um texto montado com esses dois números.

## ATIVIDADE: MEU APP USANDO O DISPOSITIVO

Aplique os mesmos conceitos no projeto de API pública que você já desenvolveu. A foto e a localização não precisam encaixar perfeitamente no tema da API. Adapte o texto da tela ao seu app.

Requisitos:

1. Usar câmera ou galeria para obter uma imagem.
2. Mostrar a imagem dentro do aplicativo.
3. Obter a localização atual.
4. Mostrar latitude e longitude.
5. Criar uma ação relacionada à localização. Pode ser "Abrir no mapa".
6. Tratar erro e permissão com uma frase na tela, sem stack trace.
7. Em até 5 linhas, explique como câmera/galeria e localização poderiam ser utilizadas de forma real no seu aplicativo.

Exemplos de adaptação:

- Pokémon: foto e local onde encontrou um Pokémon.
- Digimon: registrar um encontro.
- Receitas: foto do prato e local onde foi preparado.
- FIPE: foto de um veículo e a localização.
- Gatos ou cães: foto do próprio animal e a localização.
- Anime: um registro pessoal com foto e localização.

Entrega: o app abrindo a câmera ou a galeria, o preview visível, as coordenadas na tela e o mapa abrindo na posição lida.
