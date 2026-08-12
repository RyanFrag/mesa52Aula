import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'naipePipe'
})
export class NaipePipePipe implements PipeTransform {

  transform(value?: string): string {
    if(value == 'CLUBS'){
      return '♣';
    }else if(value == 'DIAMONDS'){
      return '♦';
    }else if(value == 'HEARTS'){
      return '♥';
    } else if(value == 'SPADES'){
      return '♠';
    }
    return value as string;
  }

}
