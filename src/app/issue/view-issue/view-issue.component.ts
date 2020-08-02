import { Component, OnInit,TemplateRef } from '@angular/core';
import { IssueHttpService } from 'src/app/issue-http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {Location} from '@angular/common'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit {
//getting user credentials
  public userId=Cookie.get('userId');

  //issue variables
  public issue;
  public issueId;
  public isAuthor;
  public allComments;
  public allUsers=[];
  public isWatcher=false;
  public allWatchers;

  //Modal variable
  modalRef: BsModalRef;

  constructor(private serv:IssueHttpService,private route:Router,private _route:ActivatedRoute, private toastr:ToastrManager,
    public location:Location,private modalService: BsModalService) { }

  ngOnInit(){
    //Checking if user logged in 
    if(this.userId==null){
      this.route.navigate(['/login'])
    }
    //getting Issue Details
    this.issueId=this._route.snapshot.paramMap.get('issueId');
    this.serv.getIssueDetails(this.issueId).subscribe(
      data=>{
        this.issue=data["data"]
        if(this.issue==null){
          this.route.navigate(['error'])
        }
        else{
        document.getElementById("description").innerHTML=this.issue["description"]
        if(this.userId==this.issue.author){
          this.isAuthor=true;
        }
        else{
          this.isAuthor=false;
        }
        for(let x of this.allUsers){
          if(x.userId==this.issue.author){
            this.issue.author=x.name
          }
          else if (x.userId==this.issue.assignedTo){
            this.issue.assignedTo=x.name
          }
          else if(this.issue.assignedTo=="false"){
            this.issue.assignedTo="Not Yet Assigned"
          }
        }
     }},
      error=>{
        this.toastr.errorToastr("Error While Fetching Issue")
      }
    )

            //get All Users
        this.serv.getAllUsers().subscribe(
          result=>{
            let all=result["data"]
            for(let x of all){
              let each={
                name:(x.firstName+" "+x.lastName),
                userId:x.userId
              }
              this.allUsers.push(each)
            }
          },
          error=>{
            this.toastr.errorToastr("Some Error Occured. Try Again")
          }
        )

  
    //get All Comments
    this.serv.getAllComments(this.issueId).subscribe(
      data =>{
        if(data["status"]==200){
          this.allComments=data["data"]
          for(let x of this.allComments){
            this.serv.getUserById(x.userId).subscribe(
              data => {
                x.userId = data["data"]
              })          
            
          }
          
        }
      },
      error=>{
        this.toastr.errorToastr("Error While Fetching Details")
      }
    )

//if iswatcher
  this.serv.isWatcher(this.issueId,this.userId).subscribe(
    data=>{
      if(data["status"]==200){
        this.isWatcher=data["data"]
        }
    },
    error=>{
      this.toastr.errorToastr("Error while fetching Issue Details")
    }
  )

  //marking notification as read
  this.serv.readNotificationForIssue(this.issueId,this.userId).subscribe(
    data=>{},
    error=>{
      this.toastr.errorToastr("Some Error Occured");
    }
      )
    
  //getting All Watchers
  this.serv.getAllWatchers(this.issueId).subscribe(
    data=>{
      if(data["status"]==200){
        this.allWatchers=data["data"]
        for(let x in this.allWatchers){
          this.serv.getUserById(this.allWatchers[x]).subscribe(
            data=>{
              this.allWatchers[x]=data["data"]
            }
          )        
        }     
       }
    },
    error=>{
      this.toastr.errorToastr("Some Error Occured. Try Again")
    }
  )

    
  }

//Delete an issue
  public deleteIssue(){
    this.serv.deleteIssue(this.issueId).subscribe(
      data=>{
        if(data["status"]==200){
          this.toastr.successToastr("Issue Deleted Successfully")
          this.route.navigate(['/dashboard'])
        }
      },
      error=>{
        this.toastr.errorToastr(error)
      }
    )
  }

//open a modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }
 

  //confirm to delete issue 
  confirmdel(): void {
    this.deleteIssue()
    this.modalRef.hide();
  }
 

  //.confirm to add to watch
  confirmwatch(): void {
    this.addTowatch()
    this.modalRef.hide();
  }


  //confirm to remove from watch
  confirmwatchremove(){
    this.removeFromWatch();
    this.modalRef.hide();
  }

//closing a modal
  decline(): void {
    this.modalRef.hide();
  }


  //going back to previous page
public goBack(){
  this.location.back();
}


//adding to watch list
public addTowatch(){
  this.serv.addToWatch(this.issueId,this.userId).subscribe(
    data=>{
      if(data["status"]==200){
        this.toastr.successToastr("Added to WatchList")
        window.location.reload()

      }
      else{
        this.toastr.errorToastr("Some Error Occured. Try Again")
      }
    },
    error=>{
      this.toastr.errorToastr("Some Error Occured. Try Again")
    }
  )

};


//remove user from watch list
public removeFromWatch(){
  this.serv.removeFromWatch(this.issueId,this.userId).subscribe(
    data=>{
      if(data["status"]===200){
        this.toastr.successToastr("Removed to WatchList")
        window.location.reload()
        
      }
      else{
        this.toastr.errorToastr("Some Error Occured. Try Again")
      }
    },
    error=>{
      this.toastr.errorToastr("Some Error Occured. Try Again")
    }
  )
}


}
