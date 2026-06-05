import { inject, Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Key } from './key';
import { Survey } from '../interfaces/survey';
import { SurveyQuestions } from '../interfaces/survey-questions';
import { SurveyModel } from '../models/surveymodel';
import { SurveyQuestionsAnswers } from '../interfaces/survey-questions-answers';
import { FormArray } from '@angular/forms';

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

  survey = signal<Survey>({
    surveyName: "",
    endDate: "",
    description: "",
    category: "",
    type: 'survey',
    questions: []
  })

  questionSignal = signal<SurveyQuestions>({
    questionInput: "",
    multipleChoice: false,
    answers:[],
    surveyId: 0
  })

  category = [
    {value: 0 ,tag: "Health & Wellness"}, 
    {value: 1 ,tag: "Team Activities"}, 
    {value: 2 ,tag: "Gaming & Entertainment"}, 
    {value: 3 ,tag: "Education & Learning"}, 
    {value: 4 ,tag: "Lifestyle & Preferences"}, 
    {value: 5 ,tag: "Technology & Innovation"} 
  ]


  constructor() {
    this.startChannel(this.allEvents, '*');
    this.setDates();
  }

  /**
   * Sets the currentDate and expireSoonDate
   * Defines expireSoonDate range by 5 days
   */
  setDates(){
    this.currentDate = new Date().toISOString().split('T')[0]
    this.expireSoonDate = new Date(new Date().setDate(new Date().getDate()+5)).toISOString().split('T')[0]
  }


  ngOnDestroy() {
    this.supabase.removeChannel(this.allEvents)
  }


  /**
   * Reads all rows from the DB
   * @param db - the fetched supabase-table
   * @returns - the fetched data-rows according to @param db 
   */
  async readDB(db: string):Promise<Survey[]|Promise<SurveyQuestions[]|Promise<SurveyQuestionsAnswers[]>>> {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*')
    return surveys ?? []
  }

    /**
   * Reads all rows from the DB
   * @param db - the fetched supabase-table
   * @returns - the fetched data-rows according to @param db 
   */
  async readSingleSurveyDB(db: string, id:string|null):Promise<Survey[]|SurveyQuestions[]|SurveyQuestionsAnswers[]> {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*, questions: "survey-questions" (id, questionInput, multipleChoice, answers:"survey-questions-answers" (questionId, id, answerInput))')
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
  async readExpireSoonDB(db: string):Promise<Survey[]> {
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
    console.log(rowData);
    const { data, error } = await this.supabase
      .from('surveys')
      .insert([
        {
          name: rowData.surveyName,
          endDate: rowData.endDate,
          description: rowData.description,
          category: rowData.category,
          type: rowData.type,
        },
      ])
      .select()
      .single()
      const surveyId = data.id;
      const surveyQuestions = rowData.questions;
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
  async insertSurveyQuestions(question:SurveyQuestions, surveyId:number){
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
  async insertQuestionAnswers(answer:SurveyQuestionsAnswers, questionId:number){
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
   * Starts the channel to listen to Realtime-Event-Changes
   * @param channel - the channel, to listen to
   * @param event - possible Realtime-Event-Changes: '*'|'INSERT'|'UPDATE'|'DELETE'
   */
  startChannel(channel: RealtimeChannel, event: '*' | 'INSERT' | 'UPDATE' | 'DELETE') {
    channel = this.supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: event, schema: 'public' },
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()
  }
}
