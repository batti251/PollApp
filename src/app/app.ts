import { Component, inject, signal } from '@angular/core';
import { ActivationEnd, RouterOutlet, Router, ResolveEnd, NavigationEnd } from '@angular/router';
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

  ngOnInit() {
    this.db.readDB('surveys');
    this.db.readDB('survey-questions');
    this.db.readDB('survey-questions-answers');
    this.changeBackgroundColor();


  }

  /**
   * 
   */
  changeBackgroundColor() {
    this.router.events.pipe().subscribe(x => {
      if (x instanceof ActivationEnd) {
        let currentUrl = x.snapshot.url
        console.log(currentUrl);
        
   
          switch (true) {
            case currentUrl.length === 0  || currentUrl[0].path === 'newSurvey' :
              document.body.style.backgroundColor = '#35273a'
              break;
            default: document.body.style.backgroundColor = 'white'
              break;
          }
      }
    });
  }

  ngOnDestroy() {

  }
}
