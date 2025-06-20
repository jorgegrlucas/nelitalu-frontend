import { UserService } from './../../services/user/user.service';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil, timer } from 'rxjs';
import { AuthRequest } from 'src/app/models/interfaces/user/authRequest';
import { AuthResponse } from 'src/app/models/interfaces/user/authResponse';
import { SignUpUserRequest } from 'src/app/models/interfaces/user/signUpUserRequest';
import { SignUpUserResponse } from 'src/app/models/interfaces/user/signUpUserResponse';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  loginCard = true;

  loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  signUpForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    address: ['', Validators.required],
    contact: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private UserService: UserService,
    private cookeService: CookieService,
    private messageService: MessageService,
    private router: Router
  ) {}

  onAction() {
    console.log('Antes do timer');
    timer(5000).subscribe(() => {
      console.log('2 segundos depois pelo RxJS');
    });
  }
  onSubmitLoginForm(): void {
    if (this.loginForm.value && this.loginForm.valid) {
      this.UserService.authUser(this.loginForm.value as AuthRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.cookeService.set('USER_INFO', response?.token);
              localStorage.setItem('token', response.token);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Bem-vindo de volta ${response.name}!`,
                life: 2000,
              });
              this.loginForm.reset();
              this.onAction();
              this.router.navigate(['dummy']);
              this.loginCard = false;
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'Username/password não conferem',
              life: 2000,
            });
          },
        });
    }
  }

  onSubmitsignUpForm(): void {
    if (this.signUpForm.value && this.signUpForm.valid) {
      this.UserService.signUpUser(this.signUpForm.value as SignUpUserRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: `Usuário criado com sucesso`,
                life: 2000,
              });
              this.signUpForm.reset();
              this.loginCard = true;
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Erro ao criar usuário',
              life: 2000,
            });
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
