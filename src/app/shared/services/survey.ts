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
  async readDB(db:string) {
    let { data: surveys, error } = await this.supabase
      .from(db)
      .select('*')
    console.log(surveys);
    console.log(db);

  }





    /**
     * 
     * @param channel - the channel, to listen to
     * @param event - possible Events: '*'|'INSERT'|'UPDATE'|'DELETE'
     */
    startChannel(channel: RealtimeChannel, event:'*'|'INSERT'|'UPDATE'|'DELETE') {
    channel = this.supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: event, schema: 'public'},
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()
  }
}
