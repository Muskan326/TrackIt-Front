import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { ViewIssueComponent } from './view-issue/view-issue.component';
import { EditIssueComponent } from './edit-issue/edit-issue.component';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import {NgxPaginationModule} from 'ngx-pagination';
import { SearchIssueComponent } from './search-issue/search-issue.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AngularEditorModule } from '@kolkov/angular-editor';






@NgModule({
  declarations: [DashboardComponent, ViewIssueComponent, EditIssueComponent, SearchIssueComponent],
  imports: [
    CommonModule,FormsModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    AngularEditorModule,
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    RouterModule.forChild([
      {path:'view/:issueId',component:ViewIssueComponent},
      {path:'edit/:issueId',component:EditIssueComponent},
      {path:'search/:searchText',component:SearchIssueComponent}

    ]),


  ]
})
export class IssueModule { }
