import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'fail-login-component',
    standalone: true,
    imports: [CommonModule],
    template: `
    
    <h1>Please contact your system admin or property manager for login information</h1>
<button onclick="window.location.href='mailto:lloydar@g.cofc.edu'">
  Contact System Admin
</button>
`
})

/*
disregard below.
*/
export class FailLoginComponent {
    constructor(public auth: AuthService, private router: Router) {}

}