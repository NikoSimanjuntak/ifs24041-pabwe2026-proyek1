pipeline {
  agent { docker { image 'node:22' } }
  options { timestamps() }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Install')  { steps { sh 'npm ci || npm install' } }
    stage('Build')    { steps { sh 'npm run build' } }
    stage('Verify')   { steps { sh 'test -f dist/index.html && ls -la dist' } }
    stage('Archive')  { steps { archiveArtifacts artifacts: 'dist/**', fingerprint: true } }
  }
  post {
    success { echo 'Frontend siap dideploy.' }
    failure { echo 'Pipeline gagal, periksa log.' }
  }
}
