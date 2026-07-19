import { Component, HostListener, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey';
import { AlphabetPipe } from '../../pipes/alphabet.pipe';
import { CreateSurveyService } from '../../../services/create-survey';

@Component({
  selector: 'app-survey-create',
  imports: [ReactiveFormsModule, AlphabetPipe],
  templateUrl: './survey-create.html',
  styleUrl: './survey-create.scss',
  providers:[CreateSurveyService]
})
export class CreateSurvey {
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
