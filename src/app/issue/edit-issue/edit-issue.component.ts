import { Component, OnInit,TemplateRef } from '@angular/core';
import { IssueHttpService } from 'src/app/issue-http.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Location } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FileMgmtService } from 'src/app/file-mgmt.service';

@Component({
  selector: 'app-edit-issue',
  templateUrl: './edit-issue.component.html',
  styleUrls: ['./edit-issue.component.css']
})
export class EditIssueComponent implements OnInit {
  //getting user credentials
  public userId=Cookie.get('userId')

  //Issue variables
  public issue;
  public issueId;
  public allUsers=[];
  public assignedId;
  public isAuthor=false;
  public newcomment;
  public allComments;
  public states=['BackLog','In-Progress','In-Test','Done']

  //Modal variable
  modalRef: BsModalRef;
  
  //Attachment variable
  fileObj: File;
  fileURL: string;

  //Rich text editor config
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '5rem',
  };
  constructor(private serv:IssueHttpService,private route:Router,private _router:ActivatedRoute,
    private toastr:ToastrManager,private location:Location,private modalService: BsModalService, private fileServ: FileMgmtService) { }

  ngOnInit(){
   

    //Checking if user lodged in
    if(this.userId==null||this.userId==undefined){
      this.route.navigate(['/login'])
    }


    //getting issue id
    this.issueId=this._router.snapshot.paramMap.get('issueId');


    //Getting issue details
    this.serv.getIssueDetails(this.issueId).subscribe(
      data=>{
        if(data["status"]==200){
          this.issue=data["data"]
        this.assignedId=this.issue.assignedTo
        if(this.issue==null){
          this.route.navigate(['error'])
        }
        document.getElementById("description").innerHTML=this.issue["description"]
        if(this.userId==this.issue.author){
          this.isAuthor=true
        }
        if(typeof(this.issue.assignedTo)=="string"){
          this.serv.getUserById(this.issue.assignedTo).subscribe(
            data=>{
              this.issue.assignedTo=data["data"]    
            }
          )
        }
        }
        else{
          this.route.navigate(['/error'])
        }
      }
    )
   

    //getting user list
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


    //get all Comments
    this.serv.getAllComments(this.issueId).subscribe(
      data =>{
        if(data["status"]==200){
          this.allComments=data["data"]
          for(let x of this.allComments){
            let a=this.allUsers.findIndex(y => y.userId ==x.userId);
            x.userId=this.allUsers[a]["name"]
          }
          
        }
      },
      error=>{
        this.toastr.errorToastr("Error While Fetching Details")
      }
    )
  }


  //Editting the issue 
  public EditIssue(){  
    let a=this.allUsers.findIndex(x => x.name === this.issue.assignedTo);
    if(a==-1){
      this.issue.assignedTo=false
    }
    else{
    this.issue.assignedTo=this.allUsers[a]["userId"]
    }
    this.serv.editIssue(this.issueId,this.issue).subscribe(
      data=>{
        if(data["status"]==200){
          if(this.newcomment!=null || this.newcomment!=undefined){
          this.addComment()}
          this.toastr.successToastr("Issue Updated Successfully")
          setTimeout(()=>this.route.navigate(['/view',this.issueId]),2000)
        }
      },
      error=>{
        this.toastr.errorToastr("Issue Updation Failed"+error)
      }
    )
  }


  //Opening a modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }
 
  //confirm to edit
  confirmEdit(): void {
    this.EditIssue()
    this.modalRef.hide();
  }
 
  //Close a modal
  decline(): void {
    this.modalRef.hide();
  }


  //Going back to previous page
  public goBack(){
    this.location.back();
  }


  //saving attachment
  public onImagePicked(event: Event): void {
    let a=(event.target as HTMLInputElement).files
    this.toastr.infoToastr("Hit Lodge button after you see the list of files attached")
    for( let x in a)
    {
      if(a[x].name!=undefined || a[x].name!="item")
       {    
        const FILE = a[x];
        this.fileObj = FILE;
        const fileForm = new FormData();
        fileForm.append('file', this.fileObj);
        this.fileServ.imageUpload(fileForm).subscribe(res => {
          this.fileURL = res['file'];
          let filedata = {
            name: FILE.name,
            key: this.fileURL
          }
          if(filedata.key!=undefined){
          this.issue.files.push(filedata)
          }
          })
       }
    }
    
  }


  //delete a comment
  deleteComment(commentId){
    this.serv.deleteComment(commentId).subscribe(
      data=>{
        if(data["status"]==200){
          this.toastr.successToastr("Comment Deleted Successfully")
          window.location.reload()
        }
      },
      error=>{}
    )
  }



  //delete an attachment
  public deleteFile(FileKey){
    let data={
      key:FileKey
    }
    this.fileServ.deleteFile(data).subscribe(
      data=>{
        if(data["status"]==200){
          this.serv.deleteFile(this.issueId,FileKey).subscribe(
            data=>{
              if(data["status"]==200){
              this.toastr.successToastr("Attachment Deleted Successfully")
              window.location.reload()
            }
          },
          error=>{
            this.toastr.errorToastr(error)
          }
          )
          
        }
        else{
          this.toastr.errorToastr("Error While Deleting File")  
          window.location.reload()

        }
      },
      error=>{
        this.toastr.errorToastr("Error WHile Deleting File")
      }
    )
  }


  //.Adding a comment
  public addComment(){

    let a=this.allUsers.findIndex(x => x.userId === this.userId);
    let username=this.allUsers[a].name
    let data={
      userId:this.userId,
      username:username,
      issueId:this.issueId,
      issueTitle:this.issue.title,
      comment:this.newcomment,
      }

    this.serv.addComment(data).subscribe(
      data=>{
        if(data["status"]==200){
          this.toastr.successToastr("Comment Added Successfully")
        }
      },
      error=>{
        this.toastr.errorToastr("Comment Not Added")
      }
    )
  }

}
