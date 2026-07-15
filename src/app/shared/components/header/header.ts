import { Component, HostListener, inject } from '@angular/core';
import { ActivationEnd, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
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

  isMobileBreakpoint: boolean = false;

  @HostListener("window:resize", [])
  onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }

  /**
   * Handler to detect window screensize for mobile design
   */
  detectScreenSize() {
    let screensize = document.body.offsetWidth
    if (screensize < 782) {
      console.log(screensize);
      this.isMobileBreakpoint = true;
    } else this.isMobileBreakpoint = false;
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
