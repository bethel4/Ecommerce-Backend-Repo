import { createServer } from './infrastructure/server/expressServer';
import { loadEnv } from './infrastructure/config/env';

async function main() {
  const env = loadEnv();
  const app = createServer();

  const PORT = env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

