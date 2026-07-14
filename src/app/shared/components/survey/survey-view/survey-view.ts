import { Component, HostListener, inject, signal } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JsonPipe, NgClass } from '@angular/common';
import { FormBuilder, ɵInternalFormsSharedModule, FormGroup, Validators, ReactiveFormsModule, FormArray, NonNullableFormBuilder } from '@angular/forms';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { SurveyResultsLive } from '../survey-results-live/survey-results-live';
import { AlphabetPipe } from '../../pipes/alphabet.pipe';
@Component({
  selector: 'app-survey-view',
  imports: [JsonPipe, AlphabetPipe, ɵInternalFormsSharedModule, RouterLink, ReactiveFormsModule, SurveyResultsLive, NgClass],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  db = inject(SurveyService)
  errorMessage = signal<boolean>(false)
  successMessage = signal<boolean>(false)
  submitted = false
  formBuilder = inject(FormBuilder)
  isMobileBreakpoint = false
  toggleSurveyResultComponent = false
  surveyResponseForm = this.formBuilder.group({
    responses: this.formBuilder.array<FormGroup>([])
  })
  surveyIsActive = false


  @HostListener("window:resize", [])
  onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }

  /**
   * Live detection on the screen width, to detect mobile Breakpoint 
   */
  detectScreenSize() {
    let screensize = document.body.offsetWidth
    if (screensize < 760) {
      this.isMobileBreakpoint = true
    } else this.isMobileBreakpoint = false;
  }


  toggleSurveyResults() {
    let btn = document.getElementById('btn__accordion')
    btn?.classList.toggle('open');
    if (this.toggleSurveyResultComponent) {
      this.toggleSurveyResultComponent = false

    } else {
      this.toggleSurveyResultComponent = true
    }
  }

  async ngOnInit() {
    let surveyId = this.route.snapshot.paramMap.get('id') as string;
    await this.db.loadLiveSurvey('surveys', surveyId)
    this.buildSurveyForm()
    this.surveyIsActive = this.calcExpiryDate(this.db.currentDate, this.db.survey().endDate) > 0
  }

  /**
   * Builds a new FormBuild-Group for the Survey Submission Form
   */
  buildSurveyForm() {
    this.surveyResponseForm = this.formBuilder.group({
      responses: this.formBuilder.array(
        this.db.survey().questions.map(question =>
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
    let surveyId = this.db.survey().id as number
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
    if (this.successMessage() == true) {
      setTimeout(() => {
        this.router.navigate([''])
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




  /**
   * Calculates the difference between both given date-strings
   * @param dateA 
   * @param dateB 
   * @returns 
   */
  calcExpiryDate(dateA: string, dateB: string|undefined): number {
    if (dateB) {
      let newDateA = new Date(dateA)
      let newDateB = new Date(dateB)
      let diff = newDateB.getTime() - newDateA.getTime()
      console.log(diff / (1000 * 60 * 60 * 24));
      
      return diff / (1000 * 60 * 60 * 24)
    } else return 0
  }

}
