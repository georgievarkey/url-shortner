import { check } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    create_urls: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/urls';
  const payload = JSON.stringify({
    longUrl: 'https://example.com/performance/test',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Create short URL
  const createRes = http.post(url, payload, params);
  check(createRes, {
    'create status is 201': (r) => r.status === 201,
    'has shortUrl': (r) => JSON.parse(r.body).shortUrl !== undefined,
  });

  if (createRes.status === 201) {
    const shortUrl = JSON.parse(createRes.body).shortUrl;
    
    // Access short URL
    const redirectRes = http.get(`http://localhost:3000/${shortUrl}`);
    check(redirectRes, {
      'redirect status is 302': (r) => r.status === 302,
      'has correct location header': (r) => r.headers['Location'] === 'https://example.com/performance/test',
    });
  }
}