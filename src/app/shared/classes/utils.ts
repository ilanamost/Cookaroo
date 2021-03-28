import { AbstractControl, ValidatorFn } from "@angular/forms";

// CONSTANTS //
export const URL_VALIDATOR =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

export const PASSWORD_VALIDATOR = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/;
export const EMAIL_VALIDATOR =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

export const SPECIAL_CHAR_REGEX = /[-[\]{}()*+?.,\\^$|#\s]/g;
export const DESKTOP_WIDTH = 1240;
export const LOADER_TIMEOUT = 1000;
export const NUMBER_OF_MILISECONDS_IN_SECOND = 1000;
export const URL_LINK_CLASS = 'url-link';
export const NUMBER_OF_BYTES_IN_MEGA_BYTE = 1024;

/**
 * Responsible for the recipe-edit form mode
 */
export enum Mode {
  EDIT = 'edit',
  CREATE = 'create'
}

/**
 * Represents File object
 */
export interface FileData {
  name?: string                   // The given file name
  size?: number                   // The given file size in bytes
  type?: string                   // The given file type
  lastModified?: Date             // The last modified date value
}

/**
 * Change the element type from 'text' to 'password' and vice versa
 * 
 * @param {string}              id                    The given element's id
 * @param {string}              id                    The input type
 */
export function showPassword(id: string, type: string) {
    var passwordEl = document.getElementById(id) as HTMLInputElement;
    if (passwordEl.type === type) {
        passwordEl.type = "text";
    } else {
        passwordEl.type = "password";
    }
}

/**
 * Toggle between showing and hiding the menu
 * 
 * @param {string}              id                    The given element's id
 */
export function toggleMenu(id: string) {
  var htmlElement = document.getElementById(id);
  if (htmlElement.style.display === "block") {
    htmlElement.style.display = "none";
  } else {
    htmlElement.style.display = "block";
  }
}

    /**
     * Validate the email control according to the regex expression
     * 
     * @param {RegExp}          emailRegex            The given email regex
     */
    export function emailValidator(emailRegex: RegExp): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
          const isEmailValid = emailRegex.test(control.value) || !control.value;
          return isEmailValid ? null : { emailInValid: { value: control.value } };
      };
  }

  /**
   * Validate the password control according to the regex expression
   * 
   * @param {RegExp}          passwordRegex         The given password regex
   */
  export function passwordValidator(passwordRegex: RegExp): ValidatorFn {
      return (control: AbstractControl): { [key: string]: any } | null => {
          const isPassValid = passwordRegex.test(control.value) || !control.value;
          return isPassValid ? null : { passwordInValid: { value: control.value } };
      };
  }

/**
 * Validate the url control
 */
export function urlValidator(urlRegex: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isUrlValid = urlRegex.test(control.value) || !control.value;
    return isUrlValid ? null : { urlInValid: { value: control.value } };
  };
}

/**
 * Check if the application should switch to mobile view
 */
export function checkIfViewMobile() {
  // if the window's width is less than the desktop width, switch to mobile view
  return (window.innerWidth <= DESKTOP_WIDTH) ? true : false;
}

/**
 * Create a mock file with the given parameters
 * 
 * @param {FileData}     
 */
export function mockFile( { name = 'file.jpg', size = NUMBER_OF_BYTES_IN_MEGA_BYTE, type = 'image/jpeg', lastModified = new Date() }: FileData ) {

  // create a blob of the given size and type
  const blob = new Blob(['a'.repeat(size)], { type });

  // update the "lastModifiedDate" value in the blob
  blob["lastModifiedDate"] = lastModified;

  // return the file with the given file name
  return new File([blob], name);
}


