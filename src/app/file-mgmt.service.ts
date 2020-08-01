import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class FileMgmtService {

  constructor(private http:HttpClient) { }
  imageUpload(imageForm: FormData) {
    console.log('image uploading');
    return this.http.post('http://trackit.api.mywebapp.tech/api/v1/users/upload', imageForm);
  }

  public deleteFile(key){
    return this.http.post('http://trackit.api.mywebapp.tech/api/v1/users/delete', key);
  }
 
}
