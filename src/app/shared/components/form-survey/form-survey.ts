import { Component, inject, signal } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { SurveyService } from '../../services/survey'; 
import { Survey } from '../../interfaces/survey';
import { SurveyModel } from '../../models/surveymodel';

@Component({
  selector: 'app-form-survey',
  imports: [ReactiveFormsModule],
  templateUrl: './form-survey.html',
  styleUrl: './form-survey.scss',
})
export class FormSurvey {
  db = inject(SurveyService)
  survey = signal<Survey> ({
    surveyName: "",
    endDate: "",
    description: "",
    category: "",
    type: 'survey'
  })

  surveyForm = new FormGroup({
    surveyName: new FormControl('Name', {
      nonNullable:true,
      validators: [
        Validators.required
      ]
    }),
    endDate: new FormControl('', {
      nonNullable:true,
      validators: [
        
      ]
    }),
    description: new FormControl('Description', {
      nonNullable:true,
      validators: [
        
      ]
    }),
  })


  /**
   * Submits the Form-data to the DB
   * Calls {@link addRowDB} for DB INSERT 
   */
  formSubmit(){
      let survey = new SurveyModel(this.surveyForm.value)
      console.log(survey);
      this.db.addRowDB(survey)
  }

}
