import { TestBed } from '@angular/core/testing';

import { IssueHttpService } from './issue-http.service';

describe('IssueHttpService', () => {
  let service: IssueHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
