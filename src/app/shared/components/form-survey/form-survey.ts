import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';


@Component({
  selector: 'app-form-survey',
  imports: [ReactiveFormsModule],
  templateUrl: './form-survey.html',
  styleUrl: './form-survey.scss',
})
export class FormSurvey {

  surveyForm = new FormGroup({
    surveyName: new FormControl('Name', {
      validators: [
        Validators.required
      ]
    }),
    endDate: new FormControl('End Date', {
      validators: [
        
      ]
    }),
    description: new FormControl('Description', {
      validators: [
        
      ]
    }),
  })


}
