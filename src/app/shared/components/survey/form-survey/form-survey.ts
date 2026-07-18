import { Component, HostListener, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey';
import { AlphabetPipe } from '../../pipes/alphabet.pipe';
import { CreateSurvey } from '../../../services/create-survey';

@Component({
  selector: 'app-form-survey',
  imports: [ReactiveFormsModule, AlphabetPipe],
  templateUrl: './form-survey.html',
  styleUrl: './form-survey.scss',
  providers:[CreateSurvey]
})
export class FormSurvey {
  db = inject(SurveyService)
  createSurvey = inject(CreateSurvey)
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
