import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appCorNaipe]'
})
export class CorNaipe {

  @Input('appCorNaipe') naipe?: string = '';
  constructor(private El: ElementRef<HTMLElement>) {
  }

  ngOnChanges(): void {
    const cartaVermelha = ['HEARTS', 'DIAMONDS'];
    const cor = cartaVermelha.includes(this.naipe!) ? '#c0392b' : '#2c3e50';
    this.El.nativeElement.style.borderColor = cor;
  }

}
