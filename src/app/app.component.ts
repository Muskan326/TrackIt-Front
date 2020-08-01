import { Component, TemplateRef } from '@angular/core';
import { IssueHttpService } from './issue-http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import {Cookie} from 'ng2-cookies'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SocialAuthService,GoogleLoginProvider,SocialUser} from "angularx-social-login";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public userId=Cookie.get('userId')
  searchText;
  modalRef: BsModalRef;

  constructor(private serv: IssueHttpService, public route: Router, private toastr: ToastrManager,private _route:ActivatedRoute,
    private modalService: BsModalService,private authService: SocialAuthService) { 
    console.log(this.userId)
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  decline(): void {
    this.modalRef.hide();
  }

 logout = () => {
   let type=Cookie.get('userType')
    if(type=='regular')
    {
      this.serv.logout(Cookie.get('userId')).subscribe(
      data => {
        if (data["status"] == 200) {
          Cookie.deleteAll()
          this.toastr.successToastr("User Logout Successful")
          this.modalRef.hide();
          this.route.navigate(['/login'])        }
        else if (data["status"] == 404) {
          console.log(data)
          this.toastr.errorToastr(data["message"])
        }
        else {
          this.toastr.errorToastr("Some Error Occured")
        }
      },
      error => {
        this.toastr.errorToastr(error)
      }
    )}
    else if(type=='social'){
      this.authService.signOut();
      Cookie.deleteAll()
      this.toastr.successToastr("User Logout Successful")
      this.modalRef.hide();
      this.route.navigate(['/login'])    }
  }
}
