import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage  {

  email = '';
  senha = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  login(){
    this.auth.login(this.email, this.senha).then(
      () => {
        this.router.navigateByUrl('/home');
      }
    )
  }
  

  entrarComGoogle(){
  
  }

  inParaCadastrar(){
    
  }
  
}
