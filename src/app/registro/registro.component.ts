import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, RegistroDTO } from '../services/auth.service';
import { CarritoService } from '../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private carrito: CarritoService,
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.value;

    const userData: RegistroDTO = {
      name: formValue.username,
      email: formValue.email,
      password: formValue.password,
      password_confirmation: formValue.confirmPassword,
    };

    //console.log(userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Usuario registrado correctamente:', response.user.id);

        localStorage.setItem('token', response.token);

        const estadoCarrito = 'abierto';

        this.authService.register(userData).subscribe({
          next: (response) => {
            console.log('Usuario registrado correctamente:', response.user?.id);

            // guarda token primero (para que el carrito use $request->user())
            localStorage.setItem('token', response.token);

            const estadoCarrito = 'abierto';

            this.carrito.crearCarrito(estadoCarrito).subscribe({
              next: (carrito) => {
                console.log('Carrito creado correctamente:', carrito);

                // Guarda el id del carrito para usarlo en ProductDetail
                localStorage.setItem('carrito_id', String(carrito.id_carrito));

                this.router.navigate(['/login']);
              },
              error: (err) => {
                console.error('Error al crear el carrito:', err);

                // navega igual si falla
                this.router.navigate(['/login']);
              },
            });
          },
          error: (error) => {
            console.error('Error del backend:', error.error);
          },
        });
      },
      error: (error) => {
        console.error('Error del backend:', error.error);
      },
    });
  }
}
