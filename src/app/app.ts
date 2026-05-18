import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Survey } from './shared/services/survey';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('pollapp');

  db = inject(Survey)

  ngOnInit(){
    this.db.readDB()
  }

  ngOnDestroy(){

  }
}
