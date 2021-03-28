import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isSaving: any = false;

  constructor(
    private formBuilder: FormBuilder,
    private fireAuth: AngularFireAuth,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    } else {
      this.isSaving = true;
      this.fireAuth
        .signInWithEmailAndPassword(
          this.loginForm.value.email,
          this.loginForm.value.password
        )
        .then((res: any) => {
          localStorage.setItem('User', JSON.stringify(res.user.za));
          this.toastr.success('Successfuly logged in');
          setTimeout(() => {
            window.location.href = 'product';
          }, 0);
        })
        .catch((err) => {
          this.toastr.error(err.message);
        });
    }
  }
}
