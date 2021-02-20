import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  // if the control doesn't have a value or the control value is empty
  if (!control.value || typeof(control.value) === 'string') {
    // return an empty observable
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = new Observable(
    (observer: Observer<{ [key: string]: boolean }>) => {
      fileReader.addEventListener("loadend", () => {
        // convert the file to an array of 8-bit unsigned integers 
        // and create a sub array of the array buffer
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
        let header = "";
        let isValid = false;

        // loop through the array
        for (let i = 0; i < arr.length; i++) {
          // convert the numbers to hexadecimal format
          header += arr[i].toString(16);
        }

        // switch the hexadecimal numbers 
        // and check for valid file formats
        switch (header) {
          // PNG format// 
          case "89504e47":
            isValid = true;
            break;

          // JPEG and JPG formats //
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            isValid = true;
            break;
          default:
            isValid = false; 
            break;
        }

        // if the file format is valid
        if (isValid) {
          // set the observable value as null
          observer.next(null);
        } else {
          // otherwise set the observable value with an object that contains an error key
          observer.next({ invalidMimeType: true });
        }

        // complete the observable
        observer.complete();
      });

      // start reading the contents of the specified File.
      fileReader.readAsArrayBuffer(file);
    }
  );

  // return the observable
  return frObs;
};
