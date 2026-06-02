import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../services/survey';
import { Survey } from '../../interfaces/survey';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-survey-view',
  imports: [],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {

  db = inject(SurveyService)
  surveyList = signal<Survey[]>([])
  private route = inject(ActivatedRoute)


   async ngOnInit(){
    await this.getSingleSurveyDB();
  }

  /**
   * Reads the Supabase-DB according to the given id from the route snapshot
   * It sets the surveyList-Signal to the according id
   */
  async getSingleSurveyDB(){
    let surveyId = this.route.snapshot.paramMap.get('id');
    let dbResponse = await this.db.readSingleSurveyDB('surveys', surveyId) as Survey[]
    this.surveyList.set(dbResponse) 
  }


}
