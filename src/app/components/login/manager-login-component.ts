// This file handles the scripting for the manager-login component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-manager-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template:`
  
  <h1>Welcome, Property Manager</h1>
  <!-- Simple form for email/password -->
   <div class = 'center-text-form'>
  <input type="email" [(ngModel)]="email" placeholder="Email" />
  <br /><br />
  <input type="password" [(ngModel)]="password" placeholder="Password" />
  <br /><br />
  <button (click)="login()">Submit</button><br>
  <a routerLink="/login/fail">I forgot/don't know login</a>
  </div>
  <!-- Error display -->
  <p *ngIf="errorMessage" style="color:red;">{{ errorMessage }}</p>
  
  `
})

export class ManagerLoginComponent { 
    // State for the form
    email = '';
    password = '';
    errorMessage = '';

    constructor(private auth: AuthService, private router: Router) {}

    async login() {
        try {
            await this.auth.loginManager(this.email,this.password);
            this.router.navigate(['/manager/dashboard'])
        } catch (error: any){
            this.errorMessage = error.message;
        }
    }
}