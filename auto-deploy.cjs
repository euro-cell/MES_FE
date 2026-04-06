const { execSync } = require('child_process');
const path = require('path');

const PROJECT_DIR = path.resolve(__dirname);
const INTERVAL = 60 * 1000; // 60초

function run(cmd) {
  return execSync(cmd, { cwd: PROJECT_DIR, encoding: 'utf8' }).trim();
}

function deploy() {
  try {
    run('git fetch origin main');

    const local = run('git rev-parse HEAD');
    const remote = run('git rev-parse FETCH_HEAD');

    if (local === remote) {
      console.log(`[${new Date().toLocaleString()}] 변경 없음.`);
      return;
    }

    console.log(`[${new Date().toLocaleString()}] 변경 감지! 배포 시작...`);

    run('git pull origin main');
    run('npm install');
    run('pm2 restart eurocell-mes');

    console.log(`[${new Date().toLocaleString()}] 배포 완료.`);
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] 오류 발생:`, err.message);
  }
}

// 즉시 1회 실행 후 주기적 반복
deploy();
setInterval(deploy, INTERVAL);
