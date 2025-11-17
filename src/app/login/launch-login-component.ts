import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink} from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'launch-login',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template:`
    <div class = 'launch'>
<h1>I am a...</h1>
  <img src="Logo.png" alt="Logo">


  <div class = 'left-side-buttons'>
  <a routerLink="/login/tenant">Tenant</a>
  <br>
  <a routerLink="/login/manager">Property Manager</a>
  <div class ='left-side-link'>
  <a routerLink="/login/fail">register new account</a>
  </div>
  </div>
  </div>
  `
})

/*
disregard below.
*/
export class LaunchLoginComponent {
    constructor(public auth: AuthService, private router: Router) {}

    async logout (){
        await this.auth.logout();
        this.router.navigate(['/login/manager'])
    }
}