import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import * as SunCalc from 'suncalc';

export interface WeatherLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface LocationWeather {
  locationLabel: string;
  updatedAt: string;
  temperatureC: number;
  feelsLikeC?: number;
  conditionText: string;
  weatherCode?: number;
  isDay?: boolean;
  humidity?: number;
  windKph?: number;
  forecastByDay: Array<{
    date: string;
    maxTempC: number;
    minTempC: number;
    sunrise: Date;
    sunset: Date;
    moonrise?: Date;
    moonset?: Date;
    moonPhase?: 'Luna nueva' | 'Luna llena';
    hours: Array<{
      time: string;
      temperatureC: number;
      conditionText: string;
      weatherCode?: number;
      isDay?: boolean;
    }>;
  }>;
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

  getWeather(location: WeatherLocation): Observable<LocationWeather> {
    const params = new HttpParams()
      .set('latitude', location.latitude)
      .set('longitude', location.longitude)
      .set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day'
      )
      .set('hourly', 'temperature_2m,weather_code,is_day')
      .set('forecast_days', '16')
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

          const forecastByDayMap = new Map<
            string,
            Array<{
              time: string;
              temperatureC: number;
              conditionText: string;
              weatherCode?: number;
              isDay?: boolean;
            }>
          >();

          hourlyTimes.forEach((time, index) => {
            const day = time.split('T')[0];
            const dayHours = forecastByDayMap.get(day) ?? [];
            dayHours.push({
              time,
              temperatureC: hourlyTemps[index] ?? 0,
              conditionText: this.weatherCodeToText(hourlyCodes[index]),
              weatherCode: hourlyCodes[index],
              isDay: hourlyIsDay[index] === 1
            });
            forecastByDayMap.set(day, dayHours);
          });

          const currentTime = current?.time;
          const currentDay = currentTime?.split('T')[0];
          const currentHour = currentTime ? `${currentTime.slice(0, 13)}:00` : undefined;
          const moonPhases = Array.from(forecastByDayMap.keys()).map((date) => ({
            date,
            phase: SunCalc.getMoonIllumination(new Date(`${date}T12:00:00Z`)).phase
          }));
          const closestNewMoonDate = this.closestMoonPhaseDate(moonPhases, (phase) => Math.min(phase, 1 - phase));
          const closestFullMoonDate = this.closestMoonPhaseDate(moonPhases, (phase) => Math.abs(phase - 0.5));

          const forecastByDay = Array.from(forecastByDayMap.entries()).map(([date, hours]) => {
            const visibleHours =
              currentHour && currentDay === date
                ? hours.filter((hour) => hour.time >= currentHour)
                : hours;

            const temperatures = hours.map((hour) => hour.temperatureC);
            const calculationDate = new Date(`${date}T12:00:00Z`);
            const sunTimes = SunCalc.getTimes(calculationDate, location.latitude, location.longitude);
            const moonTimes = SunCalc.getMoonTimes(calculationDate, location.latitude, location.longitude);
            const moonPhase = this.moonPhaseLabel(
              SunCalc.getMoonIllumination(calculationDate).phase,
              date === closestNewMoonDate,
              date === closestFullMoonDate
            );

            return {
              date,
              maxTempC: temperatures.length ? Math.max(...temperatures) : 0,
              minTempC: temperatures.length ? Math.min(...temperatures) : 0,
              sunrise: sunTimes.sunrise,
              sunset: sunTimes.sunset,
              moonrise: moonTimes.rise,
              moonset: moonTimes.set,
              moonPhase,
              hours: visibleHours
            };
          });

          return {
            locationLabel: location.label,
            updatedAt: current?.time ?? new Date().toISOString(),
            temperatureC: current?.temperature_2m ?? 0,
            feelsLikeC: current?.apparent_temperature,
            conditionText: this.weatherCodeToText(current?.weather_code),
            weatherCode: current?.weather_code,
            isDay: current?.is_day === 1,
            humidity: current?.relative_humidity_2m,
            windKph: current?.wind_speed_10m,
            forecastByDay
          };
        })
      );
  }

  private closestMoonPhaseDate(
    moonPhases: Array<{ date: string; phase: number }>,
    distanceFromPhase: (phase: number) => number
  ): string | undefined {
    return moonPhases.reduce<{ date: string; distance: number } | undefined>((closest, current) => {
      const distance = distanceFromPhase(current.phase);

      return !closest || distance < closest.distance ? { date: current.date, distance } : closest;
    }, undefined)?.date;
  }

  private moonPhaseLabel(
    phase: number,
    isClosestNewMoon: boolean,
    isClosestFullMoon: boolean
  ): 'Luna nueva' | 'Luna llena' | undefined {
    const phaseThreshold = 0.04;

    if (isClosestNewMoon && (phase <= phaseThreshold || phase >= 1 - phaseThreshold)) {
      return 'Luna nueva';
    }

    if (isClosestFullMoon && Math.abs(phase - 0.5) <= phaseThreshold) {
      return 'Luna llena';
    }

    return undefined;
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
