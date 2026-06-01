import { createApp } from '../app.js';
import { corsOptions } from '../config/cors.js';

describe('app smoke test', () => {
  it('creates the Express app with the health route registered', () => {
    const app = createApp();
    const routePaths = app._router.stack
      .filter(layer => layer.route)
      .map(layer => layer.route.path);

    expect(routePaths).toContain('/healthz');
  });

  it('allows guest cart and tracing headers for browser API calls', () => {
    expect(corsOptions.allowedHeaders).toContain('X-Guest-Id');
    expect(corsOptions.allowedHeaders).toContain('X-Request-Id');
    expect(corsOptions.exposedHeaders).toContain('X-Request-Id');
  });
});
