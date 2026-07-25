import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { SurveyService } from '../../../services/survey';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { SurveyQuestions } from '../../../interfaces/survey-questions';
import { SurveyResultsLive } from '../survey-results-live/survey-results-live';
import { AlphabetPipe } from '../../pipes/alphabet.pipe';
import { SurveyLive } from '../../../services/survey-live';
import { LocalSStorageService } from '../../../services/localStorage';

@Component({
  selector: 'app-survey-view',
  imports: [AlphabetPipe, RouterLink, ReactiveFormsModule, SurveyResultsLive,],
  templateUrl: './survey-view.html',
  styleUrl: './survey-view.scss',
})
export class SurveyView {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  db = inject(SurveyService)
  live = inject(SurveyLive)
  localStorage = inject(LocalSStorageService)
  formBuilder = inject(FormBuilder)

  errorMessage = signal<boolean>(false)
  successMessage = signal<boolean>(false)
  disableSurvey = signal<boolean>(false)
  showDisableDialog = signal<boolean>(false)

  submitted = false
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

  @ViewChild('disableDialog')
  set disableDialog(element: ElementRef<HTMLDialogElement>) {
    const dialog = element?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
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

  /**
   * Toggles survey-result-component on mobile screen
   */
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
    this.detectScreenSize();
    await this.initLiveSurvey();
    this.buildSurveyForm()
    this.surveyIsActive = this.db.calcExpiryDate(this.db.currentDate, this.db.survey().endDate) >= 0
    this.checkLocalStorage()
  }


  /**
   * Queries localStorage to search for match surveyId and dialog-state
   * Sets disableSurvey and showDialog-signal to true, when functions return according state
   */
  checkLocalStorage() {
    let surveyId = Number(this.db.currentSurveyId());
    let disableSurvey = this.localStorage.matchSubmittedSurveyId(surveyId);
    let showDialog = disableSurvey && this.localStorage.shouldShowDialog(surveyId);
    this.disableSurvey.set(disableSurvey);
    this.showDisableDialog.set(showDialog);
  }



  /**
   * Sets the showedDialog-state from the local storage
   * Closes the dialog modal
   */
  markDisableDialogAsShown(dialog: HTMLDialogElement) {
    dialog.close()
    let surveyId = Number(this.db.currentSurveyId());
    this.localStorage.markDialogAsShown(surveyId);
  }

  /**
   * Reads current Survey Result on component initialisation
   */
  async initLiveSurvey() {
    let surveyId = this.route.snapshot.paramMap.get('id') as string;
    await this.db.loadLiveSurvey('surveys', surveyId)
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
   * @returns - the new FormGroup
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
   * @param question - the SurveyQuestion
   * @returns - the new FormGroup
   */
  buildMultipleChoiceFormControl(question: SurveyQuestions): FormGroup {
    return this.formBuilder.group({
      questionId: question.id,
      selectedAnswerIds: this.formBuilder.array([], Validators.required)
    })
  }

  /**
   * Builds FormControl for SingleChoice questions
   * @param question - the SurveyQuestion
   * @returns - the new FormGroup
   */
  buildSingleChoiceFormControl(question: SurveyQuestions): FormGroup {
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
    let input = event.target as HTMLInputElement;
    let responses = this.surveyResponseForm.controls.responses.controls;
    let answerStates = responses[questionIndex].get('selectedAnswerIds') as FormArray;
    let checkedIndex = answerStates.getRawValue().findIndex((id: number) => id === answerId);
    if (input.checked) {
      if (checkedIndex === -1) {
        answerStates.push(this.formBuilder.control(answerId));
      }
    } else {
      if (checkedIndex !== -1) {
        answerStates.removeAt(checkedIndex);
      }
    }
    this.live.updateSelectedAnswer(questionIndex, answerId, input.checked);
  }

  /**
   * Picks and delivers the questionIndex and answerId from the checked input-field to servey-live-service
   * @param questionIndex - index from survey().questions
   * @param answerId - answerId from the db
   * @param event - the current change-event
   */
  updateSingleChoiceAnswers(questionIndex: number, answerId: number, event: Event) {
    let input = event.target as HTMLInputElement;
    if (!input.checked) {
      return;
    }
    this.live.updateSingleChoiceAnswer(questionIndex, answerId);
  }


  /**
   * Submit-Handler, when survey was submitted by the user
   * surveyResponseForm must be valid, to send the data to supabase
   */
  formSubmit() {
    this.submitted = true
    if (this.surveyResponseForm.valid) {
      let dialog = document.getElementById('popover-loader') as HTMLDialogElement
      this.toggleLoaderDialog(dialog);
      this.sendDataToDB(dialog);
    } else return
  }

  /**
   * Sends the surveyResponses to the DB
   * Depending on the promise state {@link showUIFeedback} triggers an equivalent UI-Feedback
   * @param dialog
   */
  sendDataToDB(dialog?: HTMLDialogElement) {
    let surveyId = this.db.survey().id as number
    this.db.sendSurveyResponseToDB(this.surveyResponses.getRawValue(), surveyId)
      .then(async () => {
        this.localStorage.addSurveyToLocalStorage(surveyId);
        await this.updateLiveResults(surveyId);
        if (dialog) {
          this.initUIFeedback(dialog, false);
        }
      })
      .catch((error) => {
        if (dialog) {
          this.initUIFeedback(dialog, true)
        }
      })
  }

  async updateLiveResults(surveyId:number) {
    this.live.resetSelectedAnswers();
    await this.db.loadLiveSurvey('surveys', String(surveyId));
  }

  /**
   * Initial Function to show the appropriate UI-Feedback, depending on @param errorFromDB 
   * @param dialog - the dialog-feedback-Element
   * @param errorFromDB - false: Database Update fulfilled ; true: Database Upload thorws error
   */
  initUIFeedback(dialog: HTMLDialogElement, errorFromDB: boolean) {
    this.toggleLoaderDialog(dialog)
    this.showDialogMessage(errorFromDB)
    if (this.successMessage() == true) {
      this.navigateToHomepage()
    }
  }

  /**
   * Dialog-Handler to show/close the dialog according to the current dialog-state
   * @param dialog - the given Dialog-Element
   */
  toggleLoaderDialog(dialog: HTMLDialogElement) {
    if (!dialog.open) {
      dialog.showModal()
    }
  }

  /**
   * Handler to show the dialog according to the promise state from {@link sendDataToDB}
   * @param errorFromDB - error state: {true: when {@link sendDataToDB} catches an error , false: when {@link sendDataToDB} was fulfilled}
   */
  showDialogMessage(errorFromDB: boolean) {
    if (errorFromDB) {
      this.errorMessage.set(true);
    } else {
      this.successMessage.set(true);
    }
  }

  /**
   * Sends the user to the root-page
   */
  navigateToHomepage() {
    setTimeout(() => {
      this.router.navigate([''])
    }, 1500)
  }

  /**
   * Closes the dialog modal from the referenced target 
   * @param event - the click event
   */
  closeDialog(event: Event) {
    let dialogRef = event.target as HTMLElement
    let dialog = dialogRef.offsetParent as HTMLDialogElement
    dialog.close()
  }
}
