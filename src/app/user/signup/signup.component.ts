import { Component, OnInit, ViewContainerRef } from '@angular/core';
import {ActivatedRoute,Router} from '@angular/router'
import {FormsModule} from '@angular/forms'
import {Cookie} from 'ng2-cookies/ng2-cookies'
import { ToastrManager } from 'ng6-toastr-notifications';
import {IssueHttpService} from 'src/app/issue-http.service'


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  
  public firstName:string;
  public lastName:string;
  public mobile:string;
  public email:string;
  public password:string;



  constructor(private _router:ActivatedRoute,private router:Router,private toastr:ToastrManager, private serv:IssueHttpService){}
     

  ngOnInit(){
  }

  public goToSignIn(){
      this.router.navigate(['/login'])
  }
  public signupFunction(){
    if (!this.firstName) {
      this.toastr.errorToastr('Enter first name')
     

    } else if (!this.lastName) {
      this.toastr.errorToastr('Enter last name')

    } else if (!this.mobile|| String(this.mobile).length!=10) {
      this.toastr.errorToastr('Enter mobile number correctly')

    } else if (!this.email) {
      this.toastr.errorToastr('Enter email')

    } else if (!this.password||this.password.length<8) {
      this.toastr.errorToastr('Mininum length of password is 8')

    } else {
    
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if(this.email.match(emailRegex) ){
    let signUpData={
      firstName:this.firstName,
      lastName:this.lastName,
      mobileNumber:this.mobile,
      password:this.password,
      email:this.email,
    }
      this.serv.signUpFunction(signUpData).subscribe(
      data=>{

        if(data["status"]==200){
          let Logindata={
            email:this.email,
            password:this.password
          }
          this.serv.loginFunction(Logindata).subscribe(
            data=>{
              if(data["status"]==200){
                this.toastr.successToastr("User Registered Successfully")
                let user=data["data"]["userDetails"]
                Cookie.set('userId',user.userId,1)
                Cookie.set('userName',user.firstName+" "+user.lastName,1)
                Cookie.set('userType','regular',1)
                this.router.navigate(['/dashboard'])
              }
            }
          )

            }

            else{
              this.toastr.errorToastr(data["message"])
            }

      }
    )

  }
else{
  this.toastr.errorToastr("Enter Valid Email And Password")
}}}



  
}
