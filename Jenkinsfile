/**
 * Jenkins Declarative Pipeline for Playwright Test Suite
 *
 * Required Jenkins Plugins:
 * 1. NodeJS Plugin (Manage Jenkins -> System Configuration -> Plugins)
 *    Configure a NodeJS installation under Global Tool Configuration named 'NodeJS-22'.
 * 2. HTML Publisher Plugin (used to publish and view playwright-report/index.html).
 * 3. Pipeline: Stage View or Blue Ocean Plugin (for stage visualization).
 */
pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    environment {
        CI = 'true'
        HEADLESS = 'true'
        BASE_URL = 'https://www.saucedemo.com'
        API_BASE_URL = 'https://jsonplaceholder.typicode.com'
        SAUCE_USERNAME = 'standard_user'
        SAUCE_PASSWORD = 'secret_sauce'
        SAUCE_LOCKED_USERNAME = 'locked_out_user'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // On Windows Jenkins agents, use `bat`, on Linux agents use `sh`
                script {
                    if (isUnix()) {
                        sh 'npm ci || npm install'
                    } else {
                        bat 'npm ci || npm install'
                    }
                }
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx playwright install --with-deps chromium'
                    } else {
                        bat 'npx playwright install chromium'
                    }
                }
            }
        }

        stage('Code Quality (Lint & Typecheck)') {
            parallel {
                stage('ESLint') {
                    steps {
                        script {
                            if (isUnix()) {
                                sh 'npm run lint'
                            } else {
                                bat 'npm run lint'
                            }
                        }
                    }
                }
                stage('Typecheck') {
                    steps {
                        script {
                            if (isUnix()) {
                                sh 'npm run typecheck'
                            } else {
                                bat 'npm run typecheck'
                            }
                        }
                    }
                }
            }
        }

        stage('Execute Playwright Tests') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run test:all'
                    } else {
                        bat 'npm run test:all'
                    }
                }
            }
        }
    }

    post {
        always {
            // Publish the generated HTML report
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report'
            ])
        }
        failure {
            // Archive screenshots, traces, and diagnostic failure artifacts
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
    }
}
