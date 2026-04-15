import { AsyncPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonApp,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonLabel,
  IonProgressBar,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { catchError, map, of, startWith } from 'rxjs';
import { LugonesWeather, WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    NgIf,
    NgFor,
    IonApp,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonProgressBar
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly weatherService = inject(WeatherService);

  readonly vm$ = this.weatherService.getLugonesWeather().pipe(
    map((weather) => ({ state: 'ready' as const, weather })),
    startWith({ state: 'loading' as const, weather: null as LugonesWeather | null }),
    catchError(() => of({ state: 'error' as const, weather: null as LugonesWeather | null }))
  );

  trackByHourTime(index: number, hour: { time: string }): string {
    return hour.time;
  }
}

