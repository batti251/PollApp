import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Survey } from './shared/services/survey';
import { FormSurvey } from "./shared/components/form-survey/form-survey";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormSurvey],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pollapp');

  db = inject(Survey)

  ngOnInit(){
    this.db.readDB('surveys')
    this.db.readDB('survey-questions')
    this.db.readDB('survey-questions-answers')
  }

  ngOnDestroy(){

  }
}
