import { Injectable } from '@angular/core';

@Injectable()
export class DocumentDownloadService {

    /**
     * downloadFileInPDFFormat
     *
     */
    downloadFileInPDFFormat(base64str: any, fileName: string): void {
        this.downloadFile(base64str, fileName, 'application/pdf', 'pdf');
    }

    /**
     * downloadFileInExcelFormat
     *
     */
    downloadFileInExcelFormat(base64str: any, fileName: string): void {
        this.downloadFile(base64str, fileName, 'application/vnd.ms-excel', 'xls');
    }

  /**
   * downloadFileInExcelFormat
   *
   */
  downloadFileInXLSMFormat(base64str: any, fileName: string): void {
    this.downloadFile(base64str, fileName, 'application/vnd.ms-excel', 'xlsm');
  }

    /**
     * downloadFile
     *
     */
    downloadFile(base64str: any, fileName: string, fileType: string, extension: string): void {

        let view;

        const binary = atob(base64str.replace(/\s/g, ''));
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        view = new Uint8Array(buffer);

        for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }

        this.downloadFileByte(view, fileName, fileType, extension);
    }

    /**
     * downloadFileByte
     *
     */
    downloadFileByte(binary: any, fileName: string, fileType: string, extension: string): void {

        const blob = new Blob([binary], { type: fileType });

        if (window.navigator.msSaveOrOpenBlob) {  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
            window.navigator.msSaveOrOpenBlob(blob, fileName + '.' + extension);
        } else {
            const a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = fileName + '.' + extension;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }





}
