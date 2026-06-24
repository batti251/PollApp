import { Component, inject } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  router = inject(Router)
  imgSrc: string = '/assets/img/icon_header_regular.svg';
  isInverted = false;
  isHidden = false;

  ngOnInit() {
    this.switchHeaderImg();
  }


  switchHeaderImg() {
    this.router.events.pipe().subscribe(x => {
      if (x instanceof ActivationEnd) {
        let url = x.snapshot.url[0]
        switch (true) {
          case url?.path == 'survey':
            this.imgSrc = '/assets/img/icon_header_invert.svg'
            this.isInverted = true
            this.isHidden = false;
            break;
          case url?.path == 'newSurvey':
            this.imgSrc = ''
            this.isHidden = true
            break;
          default: this.imgSrc = '/assets/img/icon_header_regular.svg';
            this.isInverted = false;
            this.isHidden = false;
            break;
        }
      }
    });
  }

}
