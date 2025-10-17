import { Component, Input, HostListener, ElementRef,Output, EventEmitter,} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Router } from '@angular/router';
import {ProgressBarMode, MatProgressBarModule} from '@angular/material/progress-bar';
import { FileUploadService } from 'src/app/services/FileUploadService/file-upload.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() name: string="";
  @Input() attachValue: string="";
  @Input() progress: number = 0;
  @Input() uploaded_file_array: any;
  @Input() viewUploadOption: boolean = true;
  @Output() filePreviewData = new EventEmitter<object>();
  @Output() fileDeleteData = new EventEmitter<object>();
  @Output() fileChangeData = new EventEmitter<object>();
  color:any = 'warn';
  onChange: any = () => { };
  private file: File | null = null;
  private preview: string | null = null;
  account: any;

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    if (file) {
      Object.defineProperty(file, 'remark', {
        value: this.attachValue,
        writable: false,
      });
    }
    this.onChange(file);
    this.file = file;
  }

  constructor(
    private host: ElementRef<HTMLInputElement>,
    private router: Router,

    private fileupload: FileUploadService
  ) { }

  SetFileValues(value: any, name: string, attachValue: string) {
    this.uploaded_file_array = value;
    this.name = name;
    this.attachValue = attachValue;
    /*this.onChange(fn);
    this.onTouched();*/
  }

  /**
   * Check if the router url contains the specified route
   *
   * @param {string} route
   * @returns
   * @memberof MyComponent
   */
  hasRoute(route: string) {
    return this.router.url.includes(route);
  }

  SetFileValues2(value: any, name: string, attachValue: string) {
    this.uploaded_file_array = value;
    this.name = name;
    this.attachValue = attachValue;
    /*this.onChange(fn);
    this.onTouched();*/
  }

  writeValue(value: null) {
    // clear file input
    this.host.nativeElement.value = '';
    this.file = null;
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) { }

  uploaded_preview(file: any) {
    this.filePreviewData.emit(file);
  }

  download(url:any, file_name:any): void {
    this.fileupload.download(url).subscribe((blob) => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = file_name;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  delete_uploaded(file: any) {
    this.fileDeleteData.emit(file);
  }

  changeFileStatus(file: any) {
    this.fileChangeData.emit(file);
  }
}
