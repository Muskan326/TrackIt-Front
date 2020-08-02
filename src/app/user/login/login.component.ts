import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormsModule} from '@angular/forms'
import {Cookie} from 'ng2-cookies/ng2-cookies'
import { ToastrManager } from 'ng6-toastr-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IssueHttpService } from 'src/app/issue-http.service';
import { SocialAuthService,GoogleLoginProvider,SocialUser} from "angularx-social-login";



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email:string;
  public password:string;
  user: SocialUser;
  loggedIn: boolean;
    
  constructor(private _router:ActivatedRoute,private router:Router,public toastr: ToastrManager
    ,private serv:IssueHttpService,private authService: SocialAuthService)
    { }
    

  ngOnInit(): void {
 }


 //Login for registered user
  public loginFunction(){
    if (!this.email) {
      this.toastr.errorToastr('enter email')


    } else if (!this.password) {

      this.toastr.errorToastr('enter password')


    } else {


    let login={
      email:this.email,
      password:this.password
    }
    this.serv.loginFunction(login).subscribe(
      data=>{
        
        if (data["status"] == 200) {

          let id=data["data"]["userDetails"]["userId"]
           Cookie.set('userId',id,1);  
           Cookie.set('userName', data["data"]["userDetails"]["firstName"] + ' ' + data["data"]["userDetails"]["lastName"],1);
           Cookie.set('userType','regular')
           this.toastr.successToastr("Logged In Successfully");
           this.router.navigate(['/dashboard']);

        } else if(data["status"]==404){

          this.toastr.errorToastr("User Not Registered with us")
        

        }
        else if(data["status"]==400){

          this.toastr.errorToastr("Please Check the Email and password")
        

        }
      },
      error=>{
        if(error.status==0){
          this.toastr.errorToastr("Please Check Your Internet connection")
        }
        else if(error.status==404 || error.status==400){
          this.toastr.errorToastr("Please Check The Credentials")
        }
      }
    )
  }
}


//Login for social user
signInWithGoogle(): void {
 
  let isCalled = false;
  this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  this.authService.authState.subscribe((user) => {
    this.user = user;
    this.loggedIn = (user != null);
    if(this.loggedIn && localStorage.getItem("user") == null && !isCalled)
    { isCalled = true;
      let email=this.user.email
      this.serv.getUserByEmail(email).subscribe(
        data=>{
          if(data["status"]==404){
            let newUser={
              email:this.user.email,
              firstName:this.user.firstName,
              lastName:this.user.lastName,
              mobile:'000000000',
              password:''
            }
          this.serv.signUpFunction(newUser).subscribe(
            data=>{
              if(data["status"]==200){
                let id=data["data"]["userId"]
                Cookie.set('userId',id,1);  
                Cookie.set('userName',this.user.name,1);
                Cookie.set('userType','social')
                this.toastr.successToastr("Logged In Successfully");
                this.router.navigate(['/dashboard']);               
              }
            },
            error=>{
              this.toastr.errorToastr("Some Error Occured. Try Again")
            }
          )
          }
          else if(data["status"]==200){
            let details=data["data"]
            Cookie.set('userId',details.userId,1);  
                Cookie.set('userName',this.user.name,1);
                Cookie.set('userType','social')
                this.toastr.successToastr("Logged In Successfully");
                this.router.navigate(['/dashboard']);
          }
        },
        error=>{
          this.toastr.errorToastr("Some Error Occured. Try Again")
        }
      )


    }

  });

}



}
