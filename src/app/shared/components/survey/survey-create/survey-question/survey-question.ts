import { Component, HostListener, inject } from '@angular/core';
import { CreateSurveyService } from '../../../../services/create-survey';
import { AlphabetPipe } from "../../../pipes/alphabet.pipe";
import { ReactiveFormsModule } from '@angular/forms';
import { DeferBlockBehavior } from '@angular/core/testing';

@Component({
  selector: 'app-survey-question',
  imports: [AlphabetPipe, ReactiveFormsModule],
  templateUrl: './survey-question.html',
  styleUrl: './survey-question.scss',
})
export class SurveyQuestion {

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
