import { Injectable } from '@angular/core';

import {Observable} from 'rxjs/observable';
import { Cookie } from 'ng2-cookies/ng2-cookies';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise'
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IssueHttpService {

  private url='http://trackit.api.mywebapp.tech/api/v1/users'

  constructor(private http:HttpClient) { 
  }

  
  public signUpFunction(data){

    return this.http.post(this.url+"/signup",data)
  }

  public loginFunction(data){

    return this.http.post(this.url+'/login',data)

  }

  public getIssueStats(){
    return this.http.get(this.url+'/dashboard')
  }


  public getIssueDetails(id){
    return this.http.get(this.url+'/view/'+id)
  }

  public deleteIssue(id){
    return this.http.get(this.url+'/delete/'+id)
  }

  public getAllAssignedIssues(id){
    return this.http.get(this.url+'/dashboard/assigned/'+id)
  }



  public getAllLodgedIssues(id){
    return this.http.get(this.url+'/dashboard/lodged/'+id)
  }


  public getAllUsers(){
    return this.http.get(this.url+'/all')
  }


  public getUserByEmail(email){
    return this.http.get(this.url+"/email/"+email)
  }

  public getAllIssues(){
    return this.http.get(this.url+'/issues/all')
  }

  public addToWatch(issueId,userId){
    return this.http.get(this.url+'/addWatch/'+issueId+'/'+userId)
  }

  public lodgeNewIssue(data){
    return this.http.post(this.url+'/dashboard/lodge',data)
  }

  public getUserById(id){
    return this.http.get(this.url+"/"+id)
  }

  public editIssue(id,data){
    return this.http.post(this.url+'/edit/'+id,data)
  }

  public addComment(data){
    return this.http.post(this.url+"/addComment",data)
  }

  public deleteComment(id){
    return this.http.get(this.url+"/deleteComment/"+id)
  }

  public isWatcher(issueId,userId){
    return this.http.get(this.url+"/isWatcher/"+issueId+"/"+userId)
  }

  public removeFromWatch(issueId,userId){
    return this.http.get(this.url+"/removeWatch/"+issueId+"/"+userId)
  }

  public getAllComments(id){
    return this.http.get(this.url+"/getComments/"+id)
  }

  public getNotifications(userId){
    return this.http.get(this.url+"/dashboard/notifications/"+userId)
  }

  public getAllWatchers(issueId){
    return this.http.get(this.url+"/allWatchers/"+issueId)
  }

  public readNotificationForIssue(issueId,userId){
    return this.http.get(this.url+"/dashboard/"+issueId+"/"+userId)
  }

  public markAllread(userId){
    return this.http.get(this.url+"/markAsRead/"+userId)
  }

  public logout(id){
    return this.http.get(this.url+"/logout/"+id)
  }

  public deleteFile(issueId,key){
    return this.http.get(this.url+"/delete/"+issueId+"/"+key)
  }
  public setUserInfoInLocalStorage(userInfo){
  
    localStorage.setItem('userInfo',JSON.stringify(userInfo));

  }

  public getUserInfoFromLocalStorage(){
    return JSON.parse(localStorage.getItem('userInfo'))
  }
}
