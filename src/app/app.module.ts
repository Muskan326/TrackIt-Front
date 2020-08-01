import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule,Route } from '@angular/router';
import { UserModule } from './user/user.module';
import { LoginComponent } from './user/login/login.component';
import { FormsModule } from '@angular/forms'; 
import {HttpClientModule} from '@angular/common/http'
import { ToastrModule } from 'ng6-toastr-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {IssueHttpService} from './issue-http.service'
import {FileMgmtService} from './file-mgmt.service'
import {IssueModule} from './issue/issue.module';
import { DashboardComponent } from './issue/dashboard/dashboard.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {NgxPaginationModule} from 'ngx-pagination';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider} from 'angularx-social-login';
import { Error404Component } from './error404/error404.component';

@NgModule({
  declarations: [
    AppComponent,
    Error404Component,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocialLoginModule,
    HttpClientModule,
    AngularEditorModule,
    FormsModule,
    IssueModule,
    BrowserAnimationsModule,
    UserModule,
    NgxPaginationModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    ToastrModule.forRoot(),
    RouterModule.forRoot([
      {path:'login', component:LoginComponent, pathMatch:'full'},
      {path:'dashboard',component:DashboardComponent},
      {path:'',redirectTo:'login',pathMatch:'full'},
      {path:'error',component:Error404Component},
      {path:'**', component:Error404Component},
       ])
  ],
  providers: [IssueHttpService,BsModalService,BsModalRef,FileMgmtService,    {
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '69684173440-jkkdbke2o5gue0utf4h8ja5g6ds61i1e.apps.googleusercontent.com'
          ),
        }
      ],
    } as SocialAuthServiceConfig,
  }],
  bootstrap: [AppComponent]
})


export class AppModule { }
