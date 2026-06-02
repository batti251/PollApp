import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../services/survey';
import { Survey } from '../../interfaces/survey';
import {ActivatedRoute} from '@angular/router';
import { SurveyModel } from '../../models/surveymodel';
import { JsonPipe } from '@angular/common';


@Component({
  selector: 'app-survey-view',
  imports: [JsonPipe],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {

  db = inject(SurveyService)
  survey = signal<Survey>({
    surveyName: '',
    type: 'survey',
    questions: []
  })
  
  private route = inject(ActivatedRoute)


     ngOnInit(){
     this.getSingleSurveyDB();
  }

  /**
   * Reads the Supabase-DB according to the given id from the route snapshot
   * It sets the surveyList-Signal to the according id
   */
  async getSingleSurveyDB(){
    let surveyId = this.route.snapshot.paramMap.get('id');
    let dbResponse = await this.db.readSingleSurveyDB('surveys', surveyId) as Survey[]
    this.survey.set(dbResponse[0])
  }


}
