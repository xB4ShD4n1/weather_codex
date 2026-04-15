import { AsyncPipe, DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  IonApp,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonProgressBar,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloud,
  cloudNight,
  partlySunny,
  rainy,
  snow,
  thunderstorm,
  water,
  speedometer,
  thermometer,
  sunny,
  moon
} from 'ionicons/icons';
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
    NgClass,
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
    IonLabel,
    IonProgressBar,
    IonIcon
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly weatherService = inject(WeatherService);

  constructor() {
    addIcons({
      sunny,
      moon,
      partlySunny,
      cloud,
      cloudNight,
      rainy,
      snow,
      thunderstorm,
      water,
      speedometer,
      thermometer
    });
  }

  readonly vm$ = this.weatherService.getLugonesWeather().pipe(
    map((weather) => ({ state: 'ready' as const, weather })),
    startWith({ state: 'loading' as const, weather: null as LugonesWeather | null }),
    catchError(() => of({ state: 'error' as const, weather: null as LugonesWeather | null }))
  );

  trackByHourTime(index: number, hour: { time: string }): string {
    return hour.time;
  }

  weatherIconName(code?: number, isDay = true): string {
    if (code === undefined) {
      return 'cloud';
    }

    if (code === 0) {
      return isDay ? 'sunny' : 'moon';
    }

    if (code <= 2) {
      return 'partly-sunny';
    }

    if (code === 3 || code === 45 || code === 48) {
      return isDay ? 'cloud' : 'cloud-night';
    }

    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      return 'rainy';
    }

    if (code >= 71 && code <= 77) {
      return 'snow';
    }

    if (code >= 95) {
      return 'thunderstorm';
    }

    return 'cloud';
  }

  weatherThemeClass(code?: number): string {
    if (code === 0) {
      return 'theme-clear';
    }

    if ((code !== undefined && code >= 51 && code <= 65) || (code !== undefined && code >= 80)) {
      return 'theme-rain';
    }

    if (code !== undefined && code >= 71 && code <= 77) {
      return 'theme-snow';
    }

    if (code !== undefined && code >= 95) {
      return 'theme-storm';
    }

    return 'theme-clouds';
  }
}
