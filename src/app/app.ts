import { Component, inject, signal } from '@angular/core';
import { ActivationEnd, RouterOutlet, Router } from '@angular/router';
import { SurveyService } from './shared/services/survey';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pollapp');
  router = inject(Router)
  db = inject(SurveyService)

  ngOnInit(){
    this.db.readDB('surveys');
    this.db.readDB('survey-questions');
    this.db.readDB('survey-questions-answers');
    this.changeBackgroundColor();
    
    
  }

  changeBackgroundColor(){
 this.router.events.pipe().subscribe(x => {
      if (x instanceof ActivationEnd) {
        let url = x.snapshot.url[0]
        switch (true) {
          case url?.path == 'survey' || url?.path == 'newSurvey' :
          document.body.style.backgroundColor = 'white'
            break;
          default: document.body.style.backgroundColor = '#35273a'
            break;
        }
      }
    });
  }

  ngOnDestroy(){

  }
}
