import { Component, HostListener, inject } from '@angular/core';
import { CreateSurveyService } from '../../../../services/create-survey';
import { SurveyService } from '../../../../services/survey';

@Component({
  selector: 'app-survey-meta',
  imports: [],
  templateUrl: './survey-meta.html',
  styleUrl: './survey-meta.scss',
})
export class SurveyMeta {
  db = inject(SurveyService)
  createSurvey = inject(CreateSurveyService)
  isMobileBreakpoint: boolean = false

  @HostListener("window:resize", [])
  onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }

  /**
   * Live detection on the screen width, to detect mobile Breakpoint 
   */
  detectScreenSize() {
    let screensize = document.body.offsetWidth
    if (screensize < 768) {
      this.isMobileBreakpoint = true
    } else this.isMobileBreakpoint = false;
  }
}
