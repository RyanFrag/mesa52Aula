import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CadastroPage  {
  email = ''
  senha = ''
  constructor(private auth: AuthService, private router: Router) { }
  cadastrar(){
    this.auth.cadastrar(this.email, this.senha).then(
      () => {
        this.router.navigateByUrl('/login');
      }
    )
  }
}
