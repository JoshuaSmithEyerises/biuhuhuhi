import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-tenant-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div>
  <h1>Please Enter your tenant key</h1>

  <div class = 'center-text-form'>
  <!-- Tenant passkey form -->
  <input type="text" [(ngModel)]="passkey" placeholder="Enter Passkey" />
  <br /><br />
  <button (click)="login()">Submit</button><br>
  <a routerLink="/login/fail">I forgot/don't know id</a>
  </div>
 

  <!-- Error message -->
  <p *ngIf="errorMessage" style="color:red;">{{ errorMessage }}</p>

</div>

    `
})

export class TenantLoginComponent {
    // Tenant passkey input
    passkey = '';
    errorMessage = '';

    constructor(private auth: AuthService, private router:Router) {}

    async login() {
        const success = await this.auth.loginTenant(this.passkey);

        if (success) {
            this.router.navigate(['/tenant/dashboard'])
        } else {
            this.errorMessage = 'Invalid Passkey';
        }
    }
}