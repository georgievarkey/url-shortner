export class PrometheusMetric {
    name: string;
    help: string;
    type: string;
    values: PrometheusMetricValue[];
  }
  
  export class PrometheusMetricValue {
    labels: Record<string, string>;
    value: number;
    timestamp?: number;
  }