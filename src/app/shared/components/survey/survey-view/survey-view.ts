import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { Survey } from '../../../interfaces/survey';
import { ActivatedRoute, Router } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { FormBuilder, ɵInternalFormsSharedModule, FormGroup, Validators, ReactiveFormsModule, FormArray, NonNullableFormBuilder } from '@angular/forms';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { SurveyResultsLive } from '../survey-results-live/survey-results-live';


@Component({
  selector: 'app-survey-view',
  imports: [JsonPipe, ɵInternalFormsSharedModule, ReactiveFormsModule, SurveyResultsLive],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  private activatedRoute = inject(ActivatedRoute);
  private route = inject(ActivatedRoute)
  db = inject(SurveyService)
  errorMessage = signal<boolean>(false)
  successMessage = signal<boolean>(false)
  submitted = false
  private router = inject(Router)
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
    totalSubmitsCount: 0,
    questions: []
  })

  sortedResults: any
  surveyResults = signal<Survey>({
    surveyName: "",
    endDate: "",
    description: "",
    category: "",
    type: 'survey',
    totalSubmitsCount: 0,
    questions: []
  })


  async ngOnInit() {
    await this.getSingleSurveyDB();
    this.buildSurveyForm()
  }

 

  /**
   * Reads the Supabase-DB according to the given id from the route snapshot
   * It sets the surveyList-Signal to the according id
   * It renders a sorted Survey, sort by answerId
   */
  async getSingleSurveyDB() {
    let surveyId = this.route.snapshot.paramMap.get('id');
    let dbResponse = await this.db.readSingleSurveyDB('surveys', surveyId) as Survey[]
    this.survey.set(dbResponse[0])
    this.surveyResults.set(dbResponse[0]);
    this.sortedResults = this.surveyResults().questions.map((answer: any) => {
      answer.answers.sort(this.sortId)
    })
  }

  /**
   * sort function 
   * @param a 
   * @param b 
   * @returns 
   */
   sortId(a: any, b: any): any {
    if (a.id < b.id) {
      return -1
    } else 1
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

  get surveyResponses() {
    return this.surveyResponseForm.get('responses') as FormArray
  }

  /**
   * Add or remove the dedicated FormControl from the selectedAnswerIds Array
   * It listens to the input.checked property to add/remove accordingly
   * @param questionIndex - index from the survey-question
   * @param answerId - the given answerId from Supabase
   * @param event - the click event from the checkbox
   */
  updateMultipleChoiceAnswers(questionIndex: number, answerId: number, event: Event) {
    let input = event.target as HTMLInputElement
    let array = this.surveyResponseForm.controls.responses.controls
    let answerState = array[questionIndex].get('selectedAnswerIds') as FormArray
    let checkedIndex = answerState.getRawValue().findIndex((id) => id == answerId)
    input.checked ? answerState.push(this.formBuilder.control(answerId)) : answerState.removeAt(checkedIndex)
  }

  /**
   * Submit-Handler, when survey was submitted by the user
   * surveyResponseForm must be valid, to send the data to supabase
   */
  formSubmit() {
    this.submitted = true
    if (this.surveyResponseForm.valid) {
      let dialog = document.getElementById('popover') as HTMLDialogElement
      this.toggleDialog(dialog);
      this.sendDataToDB(dialog);
    }
  }

  /**
   * Sends the surveyResponses to the DB
   * Depending on the promise state {@link showUIFeedback} triggers an equivalent UI-Feedback
   * @param dialog
   */
  sendDataToDB(dialog: HTMLDialogElement) {
    let surveyId = this.survey().id as number
    this.db.sendSurveyResponseToDB(this.surveyResponses.getRawValue(), surveyId)
      .then(() => {
        this.initUIFeedback(dialog, false)
      })
      .catch((error) => {
        this.initUIFeedback(dialog, true)
      })
  }

  /**
   * Initial Function to show the appropriate UI-Feedback, depending on @param errorFromDB 
   * @param dialog 
   * @param errorFromDB 
   */
  initUIFeedback(dialog: HTMLDialogElement, errorFromDB: boolean) {
    this.showDialogMessage(errorFromDB)
    this.toggleDialog(dialog)
    console.log(this.surveyResults());
    

    if (this.successMessage() == true) {
      setTimeout(() => {
        
        /* this.router.navigate(['']) */
        console.log("page switch");
        
      }, 2000)
    }
  }

  /**
   * Dialog-Handler to show/close the dialog according to the current dialog-state
   * @param dialog 
   */
  toggleDialog(dialog: HTMLDialogElement) {
    if (!dialog.open) {
      dialog.showModal()
    } else
      setTimeout(() => {
        dialog.close()
      }, 500);
  }

  /**
   * Handler to show the dialog according to the promise state from {@link sendDataToDB}
   * @param errorFromDB - error state: {true: when {@link sendDataToDB} catches an error , false: when {@link sendDataToDB} was fulfilled}
   */
  showDialogMessage(errorFromDB: boolean) {
    if (errorFromDB) {
      this.errorMessage.set(true);
    } else this.successMessage.set(true);
  }

}
