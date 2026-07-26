import { Injectable } from '@angular/core';
import { LocalStorageObj } from '../interfaces/localStorageObj';

@Injectable({
  providedIn: 'root',
})
export class LocalSStorageService {
  storageKey = 'attendSurvey';
  showedDialogState = false
  /**
   * Stores localStorage-JSON to the according @param key
   * @param key - the localStorage-Key 
   * @param data - the according data to the @param key
   */
  saveDataToLocalStorage(key: string, data: LocalStorageObj[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Reads the current localStorage-Dat, according to the given @param key
   * @param key - the localStorage key to read
   * @returns 
   */
  getDataFromLocalStorage(key: string): LocalStorageObj[] {
    let storedData = localStorage.getItem(key);
    if (!storedData) {
      return [];
    }
    let localData = JSON.parse(storedData);
    if (!localData) {
      return []
    }
    return localData as LocalStorageObj[]
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
    let newEntry: LocalStorageObj = {
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
  * Sets showedDialogState according to isChecked-State
  * @param isChecked - checked status from HTLMInputElement
  */
  markDialogAsShown(isChecked: boolean) {
    this.showedDialogState = isChecked
  }
/**
  * Stores the showedDialogState to the localStorage-Entry
  * @param surveyId - the given surveyId from the current Survey
  */
  saveDialogAsShownState(surveyId: number) {
    let localData = this.getDataFromLocalStorage(this.storageKey);
    let surveyEntry = localData.find(entry => entry.surveyId == surveyId);
    if (!surveyEntry) {
      return;
    }
    surveyEntry.stored.showedDialog = this.showedDialogState
    this.saveDataToLocalStorage(this.storageKey, localData);
  }
}