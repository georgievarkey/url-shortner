export class DailyClicksDto {
    date: string;
    count: number;
  }
  
  export class ReferrerStatsDto {
    referrer: string;
    count: number;
  }
  
  export class BrowserStatsDto {
    browser: string;
    count: number;
  }
  
  export class UrlStatsDto {
    totalClicks: number;
    dailyClicks: DailyClicksDto[];
    topReferrers: ReferrerStatsDto[];
    browsers: BrowserStatsDto[];
  }