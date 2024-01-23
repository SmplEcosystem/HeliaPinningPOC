import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeliaService } from '../../helia.service';

@Component({
  standalone: true,
  selector: 'home',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class About implements OnInit {
  title = 'Home Page';
  input = '';
  cid: any
  
  
  ngOnInit(): void {
    this.heliaService.init()

    
  }

  constructor(private heliaService: HeliaService) {
    
    console.log("test")
  }
  onClickMe() {
    this.cid = this.heliaService.saveText(this.input)    
    console.log("called", this.input)
  }
  onChangeMe(event: any) {
    this.input = event.target.value
    // 
  }
  onGetItemByCID() {
    this.heliaService.findText()

  }
 }