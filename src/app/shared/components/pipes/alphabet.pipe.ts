import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'alphabet',
})
export class AlphabetPipe implements PipeTransform {
    alphabet = ['A', 'B', 'C', 'D', 'E', 'F']


    transform(value: number): string {
        return this.alphabet[value]
    }

}