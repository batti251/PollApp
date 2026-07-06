import { Component, HostListener,inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SurveyService } from '../../../services/survey';
import { Survey } from '../../../interfaces/survey';
import { SurveyModel } from '../../../models/surveymodel';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-survey',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './form-survey.html',
  styleUrl: './form-survey.scss',
})
export class FormSurvey {
  db = inject(SurveyService)
  formBuilder = inject(FormBuilder)
  categories = this.db.category
  isMobileBreakpoint: boolean = false
  errorMessage = signal<boolean>(false)
  successMessage = signal<boolean>(false)
  formSubmitted:boolean = false
  router = inject(Router) ;

  surveyForm = this.formBuilder.group({
    surveyName: ['', [
      Validators.required
    ]],
    endDate: [''],
    category: ['', [
      Validators.required
    ]],
    description: [''],
    questions: this.formBuilder.array([
      this.createNewQuestion()])
  })

  @HostListener("window:resize", [])
  onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }

  /**
   * Live ddetection on the screen width, to detect mobile Breakpoint 
   */
  detectScreenSize() {
    let screensize = document.body.offsetWidth
    if (screensize < 768) {
      this.isMobileBreakpoint = true
    } else this.isMobileBreakpoint = false;
  }

  /**
   * Creates a new FormBuild-group for Question
   * @returns 
   */
  createNewQuestion() {
    return this.formBuilder.group({
      questionInput: ['', [
        Validators.required
      ]],
      multipleChoice: [false],
      answers: this.formBuilder.array([this.createNewAnswer()],
        Validators.maxLength(6)
      )
    })
  }

  /**
   * Creates a new FormBuild-group for Answer
   * @returns 
   */
  createNewAnswer(): FormGroup {
    return this.formBuilder.group({
      answerInput: ['']
    })
  }

  /**
   * Gets the 'questions'-FormArray from the surveyForm
   */
  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray
  }

  get isDirty(): boolean | undefined {
    return this.surveyForm.get('category')?.dirty
  }

  /**
   * Gets the 'answers'-FormArray, according to the questionIndex
   * @param questionIndex 
   * @returns 
   */
  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray
  }

  /**
   * Adds a new FormGroup to the 'question' FormArray control
   */
  addQuestion() {
    this.questions.push(this.createNewQuestion())
  }

  /**
   * Adds a new FormGroup to the 'answers' FormArray control
   * @param questionIndex 
   */
  addAnswer(questionIndex: number) {
    this.getAnswers(questionIndex).push(this.createNewAnswer())
  }

  /**
   * Removes the FormGroup-control at the given position and control-Array
   * It's used to delete either a question-field, or answer-field 
   * @param control 
   * @param index 
   */
  deleteControlFromArray(targetArray: FormArray, index: number) {
    if (index == 0) {
      console.log(targetArray);
      targetArray.reset()
    } else targetArray.removeAt(index)
  }

  /**
   * Resets the Input and FormGroup Value
   * @param FormGroup 
   */
  resetValue(FormGroup: String) {
    switch (FormGroup) {
      case 'surveyName':
        this.surveyForm.controls.surveyName.setValue("");
        break;
      case 'endDate':
        this.surveyForm.controls.endDate.setValue("");
        break;
      case 'description':
        this.surveyForm.controls.description.setValue("");
        break;
      default:
        this.surveyForm.controls.description.setValue("");
        break;
    }
  }


  /**
   * Submits the Form-data to the DB
   * Calls {@link addRowDB} for DB INSERT 
   */
  async formSubmit() {
    this.formSubmitted = true
    if (this.surveyForm.invalid) {
      return
    } else {
      let survey = new SurveyModel(this.surveyForm.value as Partial<Survey>)
      await this.db.addRowDB(survey)
      this.showPopover()
    }
  }

  /**
   * Handler to show Popover, when new survey form is submitted successfully
   * Afterwards it navigates the user to the recent created survey 
   * @returns 
   */
  showPopover() {
    let dialog = document.getElementById('popover')
    dialog?.showPopover();
    if (this.surveyForm.invalid) {
      this.successMessage.set(false)
      return
    } else {
      this.successMessage.set(true)
      setTimeout(() => {
        this.router.navigate([`survey/${this.db.newSurveyId()}`])
      }, 1500);
    }
  }
}
