import { inject, Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Key } from './key';
import { Survey } from '../interfaces/survey';
import { SurveyQuestions } from '../interfaces/survey-questions';
import { SurveyModel } from '../models/surveymodel';
import { SurveyQuestionsAnswers } from '../interfaces/survey-questions-answers';
import { FormArray } from '@angular/forms';
import { SurveyResponse } from '../interfaces/survey-response';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  keys = inject(Key);

  supabase = createClient(this.keys.supabaseURL, this.keys.supabaseKey)
  allEvents!: RealtimeChannel;
  surveyList = signal<Survey[]>([])
  currentDate = ''
  expireSoonDate = ''
  currentSurveyId = signal<string>("");
  toExpire = signal<Survey[]>([])
  newSurveyId = signal<number>(0)
  filteredSurveyList = signal<Survey[]>([])

  survey = signal<Survey>({
    surveyName: "",
    endDate: "",
    description: "",
    category: 0,
    type: 'survey',
    questions: []
  })


  questionSignal = signal<SurveyQuestions>({
    questionInput: "",
    multipleChoice: false,
    answers: [],
    surveyId: 0
  })

  answerSignal = signal<SurveyQuestionsAnswers>({
    answerInput: "",
    questionId: 0,
    id: 0,
    checkedCount: 0
  })

  category = [
    { value: 0, tag: "Health & Wellness" },
    { value: 1, tag: "Team Activities" },
    { value: 2, tag: "Gaming & Entertainment" },
    { value: 3, tag: "Education & Learning" },
    { value: 4, tag: "Lifestyle & Preferences" },
    { value: 5, tag: "Technology & Innovation" }
  ]

  constructor() {
    this.startChannel(this.allEvents, '*');
    this.setDates();
  }

  /**
   * Sets a filteredSurveyList() according to given @param categoryIndex
   * @param categoryIndex  - index from category
   */
  filterSurveys(categoryIndex: number) {
    let filteredTag = this.category[categoryIndex]
    let tempFilteredList = this.surveyList().filter((categoryIndex) => {
      return categoryIndex.category == filteredTag.tag
    })
    this.filteredSurveyList.set(tempFilteredList)
  }

  /**
   * Sorts and sets the survey Signal to the according db-read
   * @param db - the databank name, to load
   * @param surveyId - the specific survey-Id
   */
  async loadLiveSurvey(db: string, surveyId: string) {
    this.currentSurveyId.set(surveyId)
    let dbResponse = await this.readSingleSurveyDB(db, surveyId) as Survey[]
    this.sortSurveyResponse(dbResponse)
    this.setCategoryName(dbResponse[0])
    this.survey.set(dbResponse[0])
  }

  /**
   * sets the surveyList-Signal after {@link readDB} for all Surveys
   * @param db - the db-tables name
   */
  async loadSurveyList(db: string) {
    let dbResponse = await this.readDB(db) as Survey[]
    dbResponse.forEach((survey, index) => this.setCategoryName(dbResponse[index]))
    this.surveyList.set(dbResponse)
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
      return diff / (1000 * 60 * 60 * 24)
    } else return 0
  }

  async loadExpireSoonSurvey() {
    let dbResponse = await this.readExpireSoonDB('surveys');
    dbResponse.forEach((survey, index) => this.setCategoryName(dbResponse[index]))
    this.toExpire.set(dbResponse)
  }

  /**
   * Turns the category-numbers into the according tag-name
   * @param dbResponse - the fetched db-entry
   */
  setCategoryName(dbResponse: Survey) {
    let filteredCategory = this.category.filter((x) => x.value == dbResponse.category)
    dbResponse.category = filteredCategory[0].tag
  }

  /**
   * Sorts the Survey-Array from the db
   * @param responseArray - the according Survey-Array
   */
  sortSurveyResponse(responseArray: Survey[]) {
    responseArray.forEach(survey => {
      survey.questions.forEach(question =>
        question.answers.sort(this.sortId)
      )
    })
  }

  /**
   * sort function 
   * @param a 
   * @param b 
   * @returns 
   */
  sortId(a: SurveyQuestionsAnswers, b: SurveyQuestionsAnswers): number {
    return a.id - b.id;
  }

  /**
   * Sets the currentDate and expireSoonDate
   * Defines expireSoonDate range by 5 days
   */
  setDates() {
    this.currentDate = new Date().toISOString().split('T')[0]
    this.expireSoonDate = new Date(new Date().setTime(new Date().getTime() + 5)).toISOString().split('T')[0]
  }

  ngOnDestroy() {
    this.supabase.removeChannel(this.allEvents)
  }

  /**
   * Reads all rows from the DB
   * @param db - the fetched supabase-table
   * @returns - the fetched data-rows according to @param db 
   */
  async readDB(db: string): Promise<Survey[] | SurveyQuestions[] | SurveyQuestionsAnswers[]> {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*, questions: "survey-questions" (id, questionInput, multipleChoice, answers:"survey-questions-answers" (questionId, id, answerInput, checkedCount))')
      .order('endDate', { ascending: false })
    return surveys ?? []
  }

  /**
 * Reads all rows from the DB
 * @param db - the fetched supabase-table
 * @returns - the fetched data-rows according to @param db 
 */
  async readSingleSurveyDB(db: string, id: string | null): Promise<Survey[] | SurveyQuestions[] | SurveyQuestionsAnswers[]> {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*, questions: "survey-questions" (id, questionInput, multipleChoice, answers:"survey-questions-answers" (questionId, id, answerInput, checkedCount))')
      .eq('id', id)
    return surveys ?? []
  }

  /**
   * Reads all rows from the DB
   * It filters only surveys, that are between the currentDate and expireSoonDate range
   * expireSoonDate is defined here: {@link setDates()}
   * @param db - the fetched supabase-table
   * @returns  - the fetched data-rows according to @param db 
   */
  async readExpireSoonDB(db: string): Promise<Survey[]> {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*')
      .gte('endDate', `${this.currentDate}`)
      .lte('endDate', `${this.expireSoonDate}`)
    return surveys ?? []
  }

  /**
   * Inserts @param rowData to Supabase DB
   * Adds the data to table 'surveys' 
   * @param rowData - survey data
   */
  async addRowDB(rowData: Survey) {
    const { data, error } = await this.supabase
      .from('surveys')
      .insert([
        {
          surveyName: rowData.surveyName,
          endDate: rowData.endDate,
          description: rowData.description,
          category: rowData.category,
          type: rowData.type,
        },
      ])
      .select()
      .single()
    console.log(data);
    const surveyId = data.id;
    const surveyQuestions = rowData.questions;
    this.newSurveyId.set(data.id)
    for (const question of surveyQuestions) {
      await this.insertSurveyQuestions(question, surveyId)
    }
  }

  /**
   * called Function from {@link addRowDB} 
   * Inserts the SurveyQuestions-Object to Supabase DB
   * Adds the data to table 'survey-questions' 
   * @param question -
   * @param surveyId - given Id from Supabase table [surveys]
   */
  async insertSurveyQuestions(question: SurveyQuestions, surveyId: number) {
    const { data, error } = await this.supabase
      .from('survey-questions')
      .insert([
        {
          questionInput: question.questionInput,
          multipleChoice: question.multipleChoice,
          surveyId: surveyId
        },
      ])
      .select()
      .single()
    const answers = question.answers;
    const questionId = data.id
    for (const answer of answers) {
      await this.insertQuestionAnswers(answer, questionId)
    }
  }

  /**
   * called Function from {@link insertSurveyQuestions} 
   * Inserts the SurveyQuestionsAnswers-Object to Supabase DB 
   * @param answer - SurveyQuestionsAnswers
   * @param questionId - given Id from Supabase table [survey-questions]
   */
  async insertQuestionAnswers(answer: SurveyQuestionsAnswers, questionId: number) {
    const { data, error } = await this.supabase
      .from('survey-questions-answers')
      .insert([
        {
          answerInput: answer.answerInput,
          questionId: questionId
        },
      ])
      .select()
  }

  /**
   * Function Handler for SingleChoice-Answer and MutlipleChoice-Answer
   * For Each answerId the function {@link increaseSingleAnswerCount} will be called
   * @param surveyResponses - Array of selected AnswerIds
   */
  async sendSurveyResponseToDB(surveyResponses: SurveyResponse[], surveyId: number) {
    await this.increaseSurveyCount(surveyId);
    for (const element of surveyResponses) {
      let selectedAnswerId = element.selectedAnswerId as number
      if (element.hasOwnProperty('selectedAnswerId')) {
        await this.increaseSingleAnswerCount(selectedAnswerId)
      } else {
        for (const selectedAnswerId of element.selectedAnswerIds as number[]) {
          await this.increaseSingleAnswerCount(selectedAnswerId)
        }
      }
    }
  }

  /**
   * Reads the DB, accordingly to the selectedAnswerId
   * Increases the current Count by 1 and calls {@link updateSingleAnswerCount}-function to send newCount to DB
   * @param selectedAnswerId - answer-Id from DB
   */
  async increaseSingleAnswerCount(selectedAnswerId: number) {
    let answersFromDB = await this.readCountDB(selectedAnswerId) as { checkedCount: number }[]
    let newCount = answersFromDB[0].checkedCount
    if (answersFromDB.length > 0) {
      newCount++
      await this.updateSingleAnswerDBCount(selectedAnswerId, newCount)
    } else {
      newCount = 0
      await this.updateSingleAnswerDBCount(selectedAnswerId, newCount)
    }
  }

  /**
   * Sends @param newCount to DB and updates the according row
   * It updates the table 'survey-questions-answers'
   * @param selectedAnswerId - answer-Id from DB
   * @param newCount - the updated Count
   */
  async updateSingleAnswerDBCount(selectedAnswerId: number, newCount: number) {
    const { data, error } = await this.supabase
      .from('survey-questions-answers')
      .update({ 'checkedCount': newCount })
      .eq('id', selectedAnswerId)
      .select()
  }

  /**
   * Reads the current checkedCount colum from table 'survey-questions-answers'
   * @param selectedAnswerId - answer-Id from DB
   * @returns - the filtered row, that matches the @param selectedAnswerId
   */
  async readCountDB(selectedAnswerId: number) {
    let { data, error } = await this.supabase
      .from('survey-questions-answers')
      .select('checkedCount')
      .eq('id', selectedAnswerId)
      .order('id', { ascending: false })
    return data
  }

  /**
   * Reads the DB, accordingly to the surveyId
   * Increases the current Count by 1 and calls {@link updateSurveysDBCount}-function to send newCount to DB
   * @param surveyId - survey-Id from DB
   */
  async increaseSurveyCount(surveyId: number) {
    let readCurrentSubmitsCount = await this.readSurveyCountDB(surveyId) as { totalSubmitsCount: number }[]
    console.log(readCurrentSubmitsCount);
    let newSubmitCount = readCurrentSubmitsCount[0].totalSubmitsCount
    newSubmitCount++
    await this.updateSurveysDBCount(surveyId, newSubmitCount)
  }

  /**
   * Sends @param newSubmitCount to DB and updates the 'totalSubmitsCount'-cell
   * It updates the table 'surveys'
   * @param surveyId - survey-Id from DB
   * @param currentSubmitsCount - the increased count (increased by 1)
   */
  async updateSurveysDBCount(surveyId: number, newSubmitCount: number) {
    const { data, error } = await this.supabase
      .from('surveys')
      .update({ 'totalSubmitsCount': newSubmitCount })
      .eq('id', surveyId)
      .select()
      .throwOnError()
  }

  async readSurveyCountDB(surveyId: number) {
    let { data, error } = await this.supabase
      .from('surveys')
      .select('totalSubmitsCount')
      .eq('id', surveyId)
    if (error) {
      return error
    } else return data
  }

  /**
   * Starts the channel to listen to Realtime-Event-Changes
   * @param channel - the channel, to listen to
   * @param event - possible Realtime-Event-Changes: '*'|'INSERT'|'UPDATE'|'DELETE'
   */
  startChannel(channel: RealtimeChannel, event: '*' | 'INSERT' | 'UPDATE' | 'DELETE') {
    channel = this.supabase.channel('custom-all-channel').on('postgres_changes', { event: event, schema: 'public' },
      (payload) => {
        console.log(payload);

        if (this.currentSurveyId()) {
          this.loadLiveSurvey('surveys', this.currentSurveyId())
        }
      })
      .subscribe()
  }
}