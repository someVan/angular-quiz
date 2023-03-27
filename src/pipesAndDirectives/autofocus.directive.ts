import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: 'autofocus',
})
export class AutoFocus implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    if ((this.elementRef as any)._elementRef) {
      (this.elementRef as any)._elementRef.nativeElement.focus();
    }

    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.focus();
    }
  }
}