import { Component, OnInit, ViewChild } from '@angular/core';
import { IssueHttpService } from 'src/app/issue-http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-search-issue',
  templateUrl: './search-issue.component.html',
  styleUrls: ['./search-issue.component.css']
})
export class SearchIssueComponent implements OnInit {
  public allIssues;
  public p = 1;
  public searchText;
  public htmlContent;
  public userId = Cookie.get('userId')
  public dataSource
  public displayedColumns;

  constructor(private serv: IssueHttpService, private route: Router, private toastr: ToastrManager, private _route: ActivatedRoute) {

  }


  ngOnInit(): void {

    if(this.userId==null){
      this.route.navigate(['/login'])
    }
    this.searchText = this._route.snapshot.paramMap.get('searchText');
    if (this.searchText == "undefined") {
      this.searchText = ""
    }
    this.serv.getAllIssues().subscribe(
      data => {
        this.allIssues = data["data"]
        for (let x of this.allIssues) {
          this.serv.getUserById(x.assignedTo).subscribe(
            data => {
              x.assignedTo = data["data"]
            })

          this.serv.getUserById(x.author).subscribe(
            data => {
              x.author = data["data"]
            })
        }
      },
      error => {
        this.toastr.errorToastr("Some Error Occured. Try Again")
      }
    )


  }


  public sortTable = (n) => {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("My-Table")
    switching = true;
    dir = "asc";

    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[n];
        y = rows[i + 1].getElementsByTagName("td")[n];
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }




  pageChanged(event) {
    this.p = event
  }

  public logout = () => {
    this.serv.logout(this.userId).subscribe(
      data => {
        if (data["status"] == 200) {
          Cookie.deleteAll()
          this.toastr.successToastr("User Logout Successful")
          this.route.navigate(['/login'])
        }
        else if (data["status"] == 404) {
          this.toastr.errorToastr(data["message"])
        }
        else {
          this.toastr.errorToastr("Some Error Occured")
        }
      },
      error => {
        this.toastr.errorToastr("Some Error Occured. Try Again")
      }
    )
  }


}
