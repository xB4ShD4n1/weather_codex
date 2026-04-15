import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface LugonesWeather {
  locationLabel: string;
  updatedAt: string;
  temperatureC: number;
  feelsLikeC?: number;
  conditionText: string;
  weatherCode?: number;
  isDay?: boolean;
  humidity?: number;
  windKph?: number;
  nextHours: Array<{ time: string; temperatureC: number; weatherCode?: number; isDay?: boolean }>;
}

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  getLugonesWeather(): Observable<LugonesWeather> {
    const params = new HttpParams()
      .set('latitude', '43.4021')
      .set('longitude', '-5.8129')
      .set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day'
      )
      .set('hourly', 'temperature_2m,weather_code,is_day')
      .set('forecast_days', '1')
      .set('timezone', 'Europe/Madrid');

    return this.http
      .get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', { params })
      .pipe(
        map((response) => {
          const current = response.current;
          const hourlyTimes = response.hourly?.time ?? [];
          const hourlyTemps = response.hourly?.temperature_2m ?? [];
          const hourlyCodes = response.hourly?.weather_code ?? [];
          const hourlyIsDay = response.hourly?.is_day ?? [];

          const currentIndex = Math.max(hourlyTimes.indexOf(current?.time ?? ''), 0);
          const nextHours = hourlyTimes.slice(currentIndex + 1, currentIndex + 7).map((time, i) => ({
            time,
            temperatureC: hourlyTemps[currentIndex + 1 + i] ?? 0,
            weatherCode: hourlyCodes[currentIndex + 1 + i],
            isDay: hourlyIsDay[currentIndex + 1 + i] === 1
          }));

          return {
            locationLabel: 'Lugones, Asturias',
            updatedAt: current?.time ?? new Date().toISOString(),
            temperatureC: current?.temperature_2m ?? 0,
            feelsLikeC: current?.apparent_temperature,
            conditionText: this.weatherCodeToText(current?.weather_code),
            weatherCode: current?.weather_code,
            isDay: current?.is_day === 1,
            humidity: current?.relative_humidity_2m,
            windKph: current?.wind_speed_10m,
            nextHours
          };
        })
      );
  }

  private weatherCodeToText(code?: number): string {
    const map: Record<number, string> = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nuboso',
      3: 'Cubierto',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos fuertes',
      95: 'Tormenta'
    };

    return code !== undefined ? map[code] ?? 'Condición desconocida' : 'Sin datos';
  }
}
