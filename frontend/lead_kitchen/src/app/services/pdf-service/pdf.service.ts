import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }
  private generatePdfSubject = new Subject<number>();

  generatePdf$ = this.generatePdfSubject.asObservable();

  requestPdfGeneration(id: number) {
    this.generatePdfSubject.next(id);
  }
}
