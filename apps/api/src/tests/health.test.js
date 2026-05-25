import { createApp } from '../app.js';

describe('app smoke test', () => {
  it('creates the Express app with the health route registered', () => {
    const app = createApp();
    const routePaths = app._router.stack
      .filter(layer => layer.route)
      .map(layer => layer.route.path);

    expect(routePaths).toContain('/healthz');
  });
});
