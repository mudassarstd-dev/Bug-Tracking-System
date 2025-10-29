import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[floatLabelOnFocus]'
})
export class FloatLabelOnFocusDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('focusin') onFocus() {
    this.renderer.addClass(this.el.nativeElement, 'focused');
  }

  @HostListener('focusout') onBlur() {
    this.renderer.removeClass(this.el.nativeElement, 'focused');
  }
}
