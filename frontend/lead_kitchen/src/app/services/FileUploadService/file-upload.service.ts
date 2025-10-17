import { Injectable } from '@angular/core';

import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private apiUrl = 'http://my-api';
  constructor(private http: HttpClient) { }

  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob'
    })
  }

  changeStatusofFile(id:number, isvisible:any): Observable<any> {
    let headers = new HttpHeaders();
    //headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    /* headers = headers.append('X-API-Key', `${this.key}`);
    headers = headers.append('X-API-Version', `${this.version}`); */
   // headers = headers.append('Authorization', `Bearer ${this.accountService.userValue['jwtToken']}`);
    let body={
      isvisible:isvisible
    }
    // if (!id) {
    //   return;
    // }
    const url = `http://my-api/clientAttachment/${id}`;
    return this.http.put<any>(url, body);
    // return this.http.put(environment.MedLab_API_Root + '/clientAttachment/'+id, body ,this.prepareHeader(headers));
  }

  deleteFile(id:number): Observable<any> {
    let headers = new HttpHeaders();
    //headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    /* headers = headers.append('X-API-Key', `${this.key}`);
    headers = headers.append('X-API-Version', `${this.version}`); */
    let params = new HttpParams();

    // if (!id) {
    //   return
    // }
    const url = `http://my-api/clientAttachment/${id}`;
    
    return this.http.delete<any>(url);
    //return this.http.delete(environment.MedLab_API_Root + '/clientAttachment/'+id,headers);
  }

  uploadFile(fileData:any, remark:string): Observable<any> {
    let headers = new HttpHeaders();
    //headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
   /*  headers = headers.append('X-API-Key', `${this.key}`);
    headers = headers.append('X-API-Version', `${this.version}`); */
    let params = new HttpParams();

    // if (!fileData) {
    //   return
    // }

    let data = {
      "remark": remark
    }

     const formData: FormData = new FormData();
    /*for (let i = 0; i < fileData.length; i++) {
      formData.append(i.toString(), fileData[i], fileData[i].name);
    } */
    formData.append("file", fileData, fileData.name );
    formData.append("remark", remark );
    
    const options = {
      reportProgress: true,
      observe: 'events',
      headers
    };
  return this.http.post('http://my-api/clientAttachment', formData,{
    reportProgress: true,
    observe: 'events'
  }).pipe(catchError(this.errorMgmt));

  }

  public prepareHeader(headers: HttpHeaders | null): any {
    headers = headers || new HttpHeaders();
    /* headers = headers.append('X-API-Key', `${this.key}`);
    headers = headers.append('X-API-Version', `${this.version}`); */
    return {
        headers: headers
    };
  }

  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
      
    } else {
      // Get server-side error
      errorMessage = `Message: ${error.error.message}`;
    }
    //return errorMessage;
   /*  return throwError(() => {
      return errorMessage;
    }); */
    return throwError(errorMessage);
  }
}
