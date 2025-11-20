import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasskeyService } from '../../services/passkey.service';

@Component({
  selector: 'app-passkey-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ` 
    <div >
      <h1>Manage Tenant Passkeys</h1>

      <form (ngSubmit)="savePasskey()">
        <h2>Register New Tenant Key</h2>
        <input type="text" placeholder="Passkey" [(ngModel)]="newPasskey" name="passkey" required />
        <input type="text" placeholder="Address" [(ngModel)]="newAddress" name="address" required />
        <button type="submit">Create New</button>
      </form>

      <ul *ngIf="passkeys.length">
        <h2>Existing Tenant Keys</h2>
          <li>
          <div class = 'table-cell'>  
          Passkey </div>
          <div class = 'table-cell'>  
          Address </div>
          <div class = 'table-cell'>  
           </div>
            </li>
        <li *ngFor="let p of passkeys" style="margin-top:10px;">
          <div class = 'table-cell'>
          <strong>{{ p.passkey }}</strong> </div>
          <div class = 'table-cell'>
          {{ p.address }}</div>
          <div class = 'table-cell'>
          <button (click)="delete(p.passkey)">
          Delete</button>
        </div>
        </li>
      </ul>
    </div>
  `
})
export class PasskeyManagerComponent implements OnInit {
  passkeys: { passkey: string; address: string }[] = [];
  newPasskey = '';
  newAddress = '';

  constructor(private passkeyService: PasskeyService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    console.log("Ininit")
    this.passkeys = await this.passkeyService.getAllPasskeys();
    console.log(this.passkeys)
    // TODO Figure out how to make this update without detectchanges. This sucks but I couldn't get this to update without it
    // I believe it's something with the async call in passkeyService not registering in angular? 
    // You can see I was trying to fix it with this.zone.run but no dice. Investigate further
    this.cdr.detectChanges(); 
  }

  async savePasskey() {
    await this.passkeyService.setPasskey(this.newPasskey, this.newAddress);
    this.passkeys = await this.passkeyService.getAllPasskeys();
    this.newPasskey = this.newAddress = '';
    this.cdr.detectChanges();
  }

  async delete(passkey: string) {
    await this.passkeyService.deletePasskey(passkey);
    this.passkeys = await this.passkeyService.getAllPasskeys();
    this.cdr.detectChanges();
  }
}
