import { inject, Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Key } from './key';
import { Survey } from '../interfaces/survey';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  keys = inject(Key);

  supabase = createClient(this.keys.supabaseURL, this.keys.supabaseKey)
  allEvents!: RealtimeChannel;


  constructor() {
    this.startChannel(this.allEvents, '*')
  }



  ngOnDestroy() {
    this.supabase.removeChannel(this.allEvents)
  }


  /**
   * Reads all rows from the DB
   */
  async readDB(db: string) {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*')
    console.log(surveys);
    console.log(db);
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
          type: rowData.type
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
