import { inject, Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { Key } from './key';

@Injectable({
  providedIn: 'root',
})
export class Survey {
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
  async readDB() {
    let { data: surveys, error } = await this.supabase
      .from('surveys')
      .select('*')
    console.log(surveys);

  }






    startChannel(channel: RealtimeChannel, event:'*'|'INSERT'|'UPDATE'|'DELETE') {
    channel = this.supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: event, schema: 'public', table: 'surveys' },
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()
  }
}
