import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template:`
  
  <head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+3&display=swap" rel="stylesheet">

    <link rel="preload" href="Logo.png" as="image">

</head>
<div id = "wrapper">
<header>
  <div class = 'go-back'>
  <img src="Go Back.png" alt="Go Back" (click)="goBack()">
  </div>
</header>

<main>
  <router-outlet></router-outlet>
</main>
</div>
  
  `
})
export class AppComponent {
  title = "Airflow Portal";

  constructor(private location: Location) {} 

  goBack(): void {
    this.location.back(); 
  }
}
