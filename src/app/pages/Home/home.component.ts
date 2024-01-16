import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'home',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class Home implements OnInit {
  title = 'Home Page';
  pokemon: any;
  getPokemon: any;
  
  ngOnInit(): void {
    this.getPokemon();
  }

//   constructor() {
//     this.pokemon = ''
//     this.getPokemon = async () => {
//       try {
//         const res = await fetch(`https://pokeapi.co/api/v2/pokemon/infernape`);
//         const url = await res.json()
//         if (typeof url.sprites.other.home.front_default === 'string') this.pokemon = url.sprites.other.home.front_default;
//         return;
//       } catch (err) {
//         return 'error';
//       }
//     };
//   }
}