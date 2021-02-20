import { waitForAsync } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { mockFile } from "src/app/shared/classes/utils";
import { mimeType } from "./mime-type.validator";

describe('MimeTypeValidator', () => {
    it('should return an empty observable if the control doesn\'t have value or the value type is string', waitForAsync(() => {
        let control = new FormControl();
        control.setValue(null);
        (mimeType(control) as Observable<any>).subscribe((res) => {
            expect(res).toBeNull();
        })

        control.setValue('STRING');

        (mimeType(control) as Observable<any>).subscribe((res) => {
            expect(res).toBeNull();
        })
    }));

    it('should return an object with "invalidMimeType" key and value "true" if the file format is not valid', waitForAsync(() => {
        let control = new FormControl();
        const testFile = mockFile({ size:50000, type: 'text/plain' });
        control.setValue(testFile);

        (mimeType(control) as Observable<any>).subscribe((res) => {
            expect(res).toEqual({ invalidMimeType: true });
        });
    }));
})