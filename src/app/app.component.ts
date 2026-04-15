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
  IonProgressBar,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudOutline,
  cloudyNightOutline,
  partlySunnyOutline,
  rainyOutline,
  snowOutline,
  thunderstormOutline,
  waterOutline,
  speedometerOutline,
  thermometerOutline,
  sunnyOutline,
  moonOutline
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
      sunnyOutline,
      moonOutline,
      partlySunnyOutline,
      cloudOutline,
      cloudyNightOutline,
      rainyOutline,
      snowOutline,
      thunderstormOutline,
      waterOutline,
      speedometerOutline,
      thermometerOutline
    });
  }

  readonly vm$ = this.weatherService.getLugonesWeather().pipe(
    map((weather) => ({ state: 'ready' as const, weather })),
    startWith({ state: 'loading' as const, weather: null as LugonesWeather | null }),
    catchError(() => of({ state: 'error' as const, weather: null as LugonesWeather | null }))
  );

  trackByDay(index: number, day: { date: string }): string {
    return day.date;
  }

  trackByHourTime(index: number, hour: { time: string; conditionText: string }): string {
    return hour.time;
  }

  predominantWeatherIconName(day: { hours: Array<{ weatherCode?: number; isDay?: boolean }> }): string {
    const codeCounter = new Map<number, number>();
    let selectedCode: number | undefined;
    let maxFrequency = -1;

    day.hours.forEach((hour) => {
      if (hour.weatherCode === undefined) {
        return;
      }

      const nextFrequency = (codeCounter.get(hour.weatherCode) ?? 0) + 1;
      codeCounter.set(hour.weatherCode, nextFrequency);

      if (nextFrequency > maxFrequency) {
        selectedCode = hour.weatherCode;
        maxFrequency = nextFrequency;
      }
    });

    const representativeHour = day.hours.find((hour) => hour.weatherCode === selectedCode);

    return this.weatherIconName(selectedCode, representativeHour?.isDay ?? true);
  }

  weatherIconName(code?: number, isDay = true): string {
    if (code === undefined) {
      return 'cloud-outline';
    }

    if (code === 0) {
      return isDay ? 'sunny-outline' : 'moon-outline';
    }

    if (code <= 2) {
      return 'partly-sunny-outline';
    }

    if (code === 3 || code === 45 || code === 48) {
      return isDay ? 'cloud-outline' : 'cloudy-night-outline';
    }

    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      return 'rainy-outline';
    }

    if (code >= 71 && code <= 77) {
      return 'snow-outline';
    }

    if (code >= 95) {
      return 'thunderstorm-outline';
    }

    return 'cloud-outline';
  }

  weatherIconClass(code?: number): string {
    if (code === 0) {
      return 'icon-clear';
    }

    if (code !== undefined && code <= 2) {
      return 'icon-partly';
    }

    if (code === 3 || code === 45 || code === 48) {
      return 'icon-clouds';
    }

    if ((code !== undefined && code >= 51 && code <= 65) || (code !== undefined && code >= 80 && code <= 82)) {
      return 'icon-rain';
    }

    if (code !== undefined && code >= 71 && code <= 77) {
      return 'icon-snow';
    }

    if (code !== undefined && code >= 95) {
      return 'icon-storm';
    }

    return 'icon-clouds';
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
