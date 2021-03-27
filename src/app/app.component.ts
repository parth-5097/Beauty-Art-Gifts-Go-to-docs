import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  show: any;

  constructor(private router: Router){
  }

  ngOnInit() {
    if(!localStorage.getItem("User")){
      this.show = 'login';
      this.router.navigate(['login'])
    } else {
      if(window.location.href.match("/login")){
        this.show = 'login';
      } else {
        this.show = '';
      }
    }
  }

  logout(){
    localStorage.clear();
    this.show = 'login';
    window.location.href = 'login';
  }
}
