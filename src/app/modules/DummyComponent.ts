import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dummy',
  template: `<p>Redirecionando...</p>`,
})
export class DummyComponent {
  constructor(private router: Router) {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      this.reloadPage();
    } else {
      sessionStorage.removeItem('hasReloaded');
      this.router.navigateByUrl('/page');
    }
  }

  reloadPage() {
    window.location.reload();
  }
}
