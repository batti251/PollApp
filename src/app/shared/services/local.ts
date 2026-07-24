import { Injectable } from '@angular/core';
import { Local } from '../interfaces/local';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  storageKey = 'attendSurvey';

  /**
   * Stores localStorage-JSON to the according @param key
   * @param key - the localStorage-Key 
   * @param data - the according data to the @param key
   */
  saveDataToLocalStorage(key: string, data: Local[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Reads the current localStorage-Dat, according to the given @param key
   * @param key - the localStorage key to read
   * @returns 
   */
  getDataFromLocalStorage(key: string): Local[] {
    let storedData = localStorage.getItem(key);
    if (!storedData) {
      return [];
    }
    let localData = JSON.parse(storedData);
    if (!localData) {
      return []
    }
    return localData as Local[]
  }

  /**
   * Adds new survey-Entry to localStorage, if it not exist currently.
   * @param surveyId - the given surveyId from the current Survey
   * @returns 
   */
  addSurveyToLocalStorage(surveyId: number): void {
    let localData = this.getDataFromLocalStorage(this.storageKey);
    let alreadyExists = localData.some(entry => entry.surveyId == surveyId);
    if (alreadyExists) {
      return;
    }
    let newEntry: Local = {
      surveyId, stored: {
        showedDialog: false,
      },
    };
    localData.push(newEntry);
    this.saveDataToLocalStorage(this.storageKey, localData);
  }

  /**
   * Searchs for the given surveyId in the local storage
   * @param surveyId - the given surveyId from the current Survey
   * @returns (true: when the surveyId-Entry was found in the localStorage; false: when no surveyId-Entry was found in the local Storage)
   */
  matchSubmittedSurveyId(surveyId: number): boolean {
    let localData = this.getDataFromLocalStorage(this.storageKey);
    return localData.some(entry => entry.surveyId == surveyId);
  }

  /**
   * Searchs for the showedDialog-state in given surveyId-entry in the local storage
   * @param surveyId - the given surveyId from the current Survey
   * @returns (true: when the showedDialog-state was found in the localStorage; false: when no surveyEntry was found in the local Storage)
   */
  shouldShowDialog(surveyId: number): boolean {
    let localData = this.getDataFromLocalStorage(this.storageKey);
    let surveyEntry = localData.find(entry => entry.surveyId == surveyId);
    if (!surveyEntry) {
      return true;
    }
    return !surveyEntry.stored.showedDialog;
  }

  /**
   * Sets showedDialog-State to true, when it matches the given surveyId
   * Stores the showedDialog-State accordingly.
   * @param surveyId - the given surveyId from the current Survey
   * @returns (true: when the showedDialog-state was found in the localStorage; false: when no surveyEntry was found in the local Storage)
  */
  markDialogAsShown(surveyId: number): void {
    let localData = this.getDataFromLocalStorage(this.storageKey);
    let surveyEntry = localData.find(entry => entry.surveyId == surveyId);
    if (!surveyEntry) {
      return;
    }
    surveyEntry.stored.showedDialog = true;
    this.saveDataToLocalStorage(this.storageKey, localData);
  }
}