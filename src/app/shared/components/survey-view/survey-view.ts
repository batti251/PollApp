import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../services/survey';
import { Survey } from '../../interfaces/survey';
import { ActivatedRoute } from '@angular/router';
import { SurveyModel } from '../../models/surveymodel';
import { JsonPipe } from '@angular/common';
import { FormControl, FormBuilder, ɵInternalFormsSharedModule, FormGroup, Validators, ReactiveFormsModule, FormArray, NonNullableFormBuilder } from '@angular/forms';
import { SurveyQuestions } from '../../interfaces/survey-questions';
import { SurveyResponse } from '../../interfaces/survey-response';



@Component({
  selector: 'app-survey-view',
  imports: [JsonPipe, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {

  private route = inject(ActivatedRoute)
  db = inject(SurveyService)


  formBuilder = inject(FormBuilder)
  surveyResponseForm = this.formBuilder.group({
    responses: this.formBuilder.array<FormGroup>([])
  })

  survey = signal<Survey>({
    surveyName: "",
    endDate: "",
    description: "",
    category: "",
    type: 'survey',
    questions: []
  })

  async ngOnInit() {
    await this.getSingleSurveyDB();
    this.buildSurveyForm()
  }

  /**
   * Reads the Supabase-DB according to the given id from the route snapshot
   * It sets the surveyList-Signal to the according id
   */
  async getSingleSurveyDB() {
    let surveyId = this.route.snapshot.paramMap.get('id');
    let dbResponse = await this.db.readSingleSurveyDB('surveys', surveyId) as Survey[]
    this.survey.set(dbResponse[0])
    console.log(dbResponse[0]);
  }

/**
 * Builds a new FormBuild-Group for the Survey Submission Form
 */
  buildSurveyForm() {
    this.surveyResponseForm = this.formBuilder.group({
      responses: this.formBuilder.array(
        this.survey().questions.map(question =>
          this.createAnswerFormGroup(question)
        )
      )
    }
    )
  }

  /**
   * Handler, to Build a Answer-Form-Control depending on the @param question multipleChoice-state
   * It builds either two different FormControl: MultipleChoice or SingleChoice FormControl
   * @param question - the SurveyQuestion
   * @returns 
   */
  createAnswerFormGroup(question: SurveyQuestions): FormGroup {
    if (question.multipleChoice) {
      return this.buildMultipleChoiceFormControl(question)
    } else {
      return this.buildSingleChoiceFormControl(question)
    }
  }

/**
 * Builds FormControl for MultipleChoice questions
 * The initial FormArray is empty and will be filled by {@link changeArray()}
 * @param question  - the SurveyQuestion
 * @returns 
 */
  buildMultipleChoiceFormControl(question: SurveyQuestions) {
    return this.formBuilder.group({
      questionId: question.id,
      selectedAnswerIds: this.formBuilder.array([], Validators.required)
    })
  }

/**
 * Builds FormControl for SingleChoice questions
 * @param question  - the SurveyQuestion
 * @returns 
 */
  buildSingleChoiceFormControl(question: SurveyQuestions) {
    return this.formBuilder.group({
      questionId: question.id,
      selectedAnswerId: this.formBuilder.control('', Validators.required)
    })
  }

  /**
   * Add or remove the dedicated FormControl from the selectedAnswerIds Array
   * It listens to the input.checked property to add/remove accordingly
   * @param questionIndex - index from the survey-question
   * @param answerId - the given answerId from Supabase
   * @param event - the click event from the checkbox
   */
  updateMultipleChoiceAnswers(questionIndex:number, answerId: number, event:Event){
    let input = event.target as HTMLInputElement
    let array = this.surveyResponseForm.controls.responses.controls
    let answerState = array[questionIndex].get('selectedAnswerIds') as FormArray
    let checkedIndex = answerState.getRawValue().findIndex((id) => id == answerId)
      input.checked ? answerState.push(this.formBuilder.control(answerId))  :  answerState.removeAt(checkedIndex)
  }

  formSubmit() {
        console.log(this.surveyResponseForm);
    console.log();
    console.log(this.survey().questions);
    console.log(this.surveyResponseForm.value.responses);
    let responseObj = this.surveyResponseForm.value.responses as SurveyResponse[]
    if (this.surveyResponseForm.valid) {
      this.db.sendSurveyResponseToDB(responseObj)
    }
    else console.log("fail");
  }


}
