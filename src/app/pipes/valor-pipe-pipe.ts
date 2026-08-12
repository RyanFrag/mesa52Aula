import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valorPipe'
})
export class ValorPipePipe implements PipeTransform {

  transform(value?: string): string {
    if(value == 'KING'){
      return 'Rei'
    }else if(value == 'QUEEN'){
      return 'Rainha'
    }else if(value == 'JACK'){
      return 'Valete'
    } else if(value == 'ACE'){
      return 'Ás'
    }
    return value as string;
  }

}
