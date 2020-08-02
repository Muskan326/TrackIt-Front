import { Component, OnInit, TemplateRef } from '@angular/core';
import { IssueHttpService } from 'src/app/issue-http.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FileMgmtService } from 'src/app/file-mgmt.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  // getting user credentials
  public username=Cookie.get('userName');
  public userId = Cookie.get('userId');

  //Lodge issue variables
  public title;
  public description;
  public assignedTo = false;
  public comments;
  public allAssignedIssues;
  public allUsers = [];
  public state='Backlog';

  //pagination variable
  p = 1;
  pn=1;

  //notification variable
  allNotify;
  notifyCount = 0;

  //file variable
  fileObj: File;
  fileURL: string;
  allfiles = [];
  selectedFiles: FileList;

  //modal variable
  modalRef: BsModalRef;

  //filter variable
  public searchTitle;
  public searchState;
  public searchReporter;
  public TableToDisplay;
  public searchText;
  searchDate: any;

  //text editor config
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '5rem',
  };

  constructor(private serv: IssueHttpService, private route: Router, public toastr: ToastrManager,
    private fileServ: FileMgmtService, private modalService: BsModalService) {
  }

  ngOnInit() {

    Cookie.set('dir', "asc")

    //checking if user lodged in
    if(this.userId==null){
      this.route.navigate(['/login'])
    }


    //getting list of all users   
    this.serv.getAllUsers().subscribe(
      result => {
        let all = result["data"]
        for (let x of all) {
          let each = {
            name: (x.firstName + " " + x.lastName),
            userId: x.userId
          }
          this.allUsers.push(each)
        }
      },
      error => {
        this.toastr.errorToastr("Some Error Occured. Try Again")
      }
    )

    //getting all assigned Issues
    this.serv.getAllAssignedIssues(this.userId).subscribe(
      data => {
        this.allAssignedIssues = data["data"]
        for (let x of this.allAssignedIssues) {
          this.serv.getUserById(x.assignedTo).subscribe(
            data => {
              x.assignedTo = data["data"]
            })

          this.serv.getUserById(x.author).subscribe(
            data => {
              x.author = data["data"]
            })
        }
        this.TableToDisplay=this.allAssignedIssues
      },
      error => {
        this.toastr.errorToastr("Some Error Occured. Try Again")
      }
    )

    //getting all notifications
    setInterval(() => {
      this.serv.getNotifications(this.userId).subscribe(
        data => {
          if (data["status"] == 200 && data["data"]!=null) {
            this.allNotify = data["data"]["notify"]
            this.notifyCount = this.allNotify.length
          }
        }
      )
    }, 2000)
  }

  reset(){
    this.TableToDisplay=this.allAssignedIssues
    this.searchTitle="";
    this.searchState="";
    this.searchReporter="";
    this.searchDate="";
  }


  //Open a modal
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  //mark all notification as read
  markAllRead() {
    this.serv.markAllread(this.userId).subscribe(
      data => {
        if (data["status"] == 200) {
          this.toastr.successToastr("All Notifications Marked as Read")
          this.modalRef.hide();

        }
      },
      error => {
        this.toastr.errorToastr("Some error occured. Try Again")
      }
    )
  }

  //close a modal
  decline(): void {
    this.modalRef.hide();
  }


  //uploading an attachment
  public onImagePicked(event: Event): void {
    let a = (event.target as HTMLInputElement).files
    if (a.length > 0) {
      this.toastr.infoToastr("Hit Lodge button after you see the list of files attached")
    }
    for (let x in a) {
      if(a[x].size>2097152){
        this.toastr.errorToastr("Files greater than 2MB cannot be uploded. Not able to upload "+a[x].name)
        continue;
      }
      if (a[x].name != undefined || a[x].name != "item") {
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
          if (filedata.key != undefined) {
            this.allfiles.push(filedata)
          }
        })
      }
    }

  }


  //going to search page
  public goToSearch(searchText) {
    this.route.navigate(['/search', searchText])
  }


  //lodging a new issue
  public lodge() {
    let validateInput = () => {
      return new Promise((resolve, reject) => {
        if (!this.title) {
          this.toastr.errorToastr('Enter Title')
          reject(null)

        } else if (!this.description) {
          this.toastr.errorToastr('Enter Description')
          reject(null)

        }
        else {
          let a = this.allUsers.findIndex(x => x.name === this.assignedTo);
          if (this.assignedTo) {
            this.assignedTo = this.allUsers[a]["userId"]
          }
          let issueDetail = {
            title: this.title,
            description: this.description,
            author: this.userId,
            assignedTo: this.assignedTo,
            files: this.allfiles
          }
          resolve(issueDetail)
        }
      })
    }


    let saveIssue = (issueDetail) => {
      return new Promise((resolve, reject) => {
        let watch;
        this.serv.lodgeNewIssue(issueDetail).subscribe(
          data => {
            if (data["status"] == 200) {
              if(data["data"]["assignedTo"]!="false"){
              watch = {
                issueId: data["data"]["issueId"],
                watcher: [data["data"]["author"], data["data"]["assignedTo"]]
              }
            }
            else{
              watch={
                issueId: data["data"]["issueId"],
                watcher:data["data"]["author"]
              }
            }
              resolve(watch)
            }
            else {
              reject(null)
            }
          },
          error => {
            reject(null)
          })
      })
    }

    let saveWatcher = (watch) => {
      return new Promise((resolve, reject) => {
        this.serv.addToWatch(watch.issueId, watch.watcher).subscribe(
          result => {
            if (result["status"] == 200) {
              resolve(result["data"]["issueId"])
            }
            else {
              reject(null)
            }

          },
          error => {
            reject(null)
          }
        )
      })
    }

    validateInput()
      .then(saveIssue)
      .then(saveWatcher)
      .then((resolve) => {
        this.toastr.successToastr("Issue Lodged Successfully");
        let id = resolve
        this.route.navigate(['/view/' + id])
      })
      .catch((err) => {
        this.toastr.errorToastr("error while Lodging Issue")
      })
  }

  pageChanged(event,id) {
   if(id==1){
     this.p=event
   }
   else{
     this.pn=event
   }
  }


  //Sorting the assigned issue table
  public sortTable = (n) => {
    var table = this.allAssignedIssues;
    var swap = [];
    var a;
    switch (n) {
      case 0: { for (a = 0; a < table.length; a++) { swap.push(table[a].title.toLowerCase()) } break; }
      case 1: { for (a = 0; a < table.length; a++) { swap.push(table[a].state.toLowerCase()) } break; }
      case 2: { for (a = 0; a < table.length; a++) { swap.push(table[a].author.toLowerCase()) } break; }
      case 3: { for (a = 0; a < table.length; a++) { swap.push(table[a].created) } break; }
    }
    if (Cookie.get('dir') == "des") {
      for (let i = 0; i < table.length; i++) {
        for (let j = i + 1; j < table.length; j++) {
          if (swap[j] < swap[i]) {
            let temp = swap[j];let temp2 = table[j];
            swap[j] = swap[i]; table[j] = table[i];
            swap[i] = temp;table[i] = temp2;
          }
        }
      }
      Cookie.set("dir", "asc")
    }
    else if (Cookie.get('dir') == "asc") {
      for (let i = table.length; i >= 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
          if (swap[j] < swap[i]) {
            let temp = swap[j];let temp2 = table[j];
            swap[j] = swap[i]; table[j] = table[i];
            swap[i] = temp;table[i] = temp2;
          }
        }
      }
      Cookie.set("dir", "des")
    }
  }


//filtering the assigned issue table
  public filterTable() {
    var table = this.allAssignedIssues;
    var a, filterText;
    var newTable1 = [];
    var newTable2 = [];
    var newTable3 = [];
    var finalTable = [];

    if (this.searchTitle != undefined && this.searchTitle.length != 0) {
      let swap = [];
      filterText = this.searchTitle.toLowerCase();
      for (a = 0; a < table.length; a++) { swap.push(table[a].title.toLowerCase()) }
      for (let x in swap) {
        if (swap[x].search(filterText) != -1) { newTable1.push(table[x]) }
      }  }
    else {
      newTable1 = table;
    }

    if (this.searchState != undefined && this.searchState.length != 0) {
      let swap = [];
      filterText = this.searchState.toLowerCase();
      for (a = 0; a < newTable1.length; a++) { swap.push(newTable1[a].state.toLowerCase()) }
      for (let x in swap) {
        if (swap[x].search(filterText) != -1) { newTable2.push(newTable1[x]) }
      } }
    else {
      newTable2 = newTable1;
    }
    if (this.searchReporter != undefined && this.searchReporter.length != 0) {
      let swap = [];
      filterText = this.searchReporter.toLowerCase();
      for (a = 0; a < newTable2.length; a++) { swap.push(newTable2[a].author.toLowerCase()) }
      for (let x in swap) {
        if (swap[x].search(filterText) != -1) { newTable3.push(newTable2[x]) }
      }  }
    else {
      newTable3 = newTable2;
    }
       if (this.searchDate != undefined && this.searchDate.length != 0) {
      let swap = [];
      filterText = this.searchDate;
      for (a = 0; a < newTable3.length; a++) { swap.push(newTable3[a].assignedTo.toLowerCase()) }
      for (let x in swap) {
        if (swap[x].search(filterText) != -1) { finalTable.push(newTable3[x]) }
      }
    }
    else {
      finalTable = newTable3;
    }
    this.TableToDisplay = finalTable;
    }
}






