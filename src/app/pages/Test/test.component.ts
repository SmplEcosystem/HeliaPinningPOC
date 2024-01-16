import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'home',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class Test implements OnInit {
  title = 'Something to test out';
  
  
  ngOnInit(): void {
    
  }

}