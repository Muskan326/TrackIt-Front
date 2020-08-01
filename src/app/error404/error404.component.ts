import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.css']
})
export class Error404Component implements OnInit {

  public userId=Cookie.get('userId')
  constructor( private route: Router) { }

  ngOnInit(): void {

    if(this.userId==null || this.userId==undefined){
      this.route.navigate(['/login'])
    }
  }

}
