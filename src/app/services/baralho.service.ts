import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Baralho } from '../models/baralho'
import { Observable } from 'rxjs'
import { CompraCarta } from '../models/compraCarta';

@Injectable({
  providedIn: 'root',
})
export class BaralhoService {

  private readonly baseUrl = 'https://deckofcardsapi.com/api/deck'

  constructor(private http: HttpClient){}

  criarBaralho(): Observable<Baralho>{
    return this.http.get<Baralho>(`${this.baseUrl}/new/shuffle/?deck_count=1`)
  }

  comprarCartas(
    deckId: string,
    quantidade: number
  ): Observable<CompraCarta> {
    return this.http.get<CompraCarta>(`${this.baseUrl}/${deckId}/draw/?count=${quantidade}`)
  }


}
