import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Overview } from "../overview/overview";

@Component({
  selector: 'app-hero',
  imports: [RouterLink, Overview],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}
