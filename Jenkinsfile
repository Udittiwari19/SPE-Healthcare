pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_IMAGE_BACKEND = 'udit019/healthcare-backend'
        DOCKER_IMAGE_FRONTEND = 'udit019/healthcare-frontend'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Udittiwari19/SPE-Healthcare.git'
            }
        }

        stage('Build & Test') {
            steps {
                sh 'mvn clean package -B'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                    jacoco execPattern: '**/target/jacoco.exec'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        mvn sonar:sonar \
                          -Dsonar.projectKey=healthcare-backend \
                          -Dsonar.projectName="Healthcare Backend" \
                          -Dsonar.host.url=http://localhost:9000 \
                          -Dsonar.login=${SONARQUBE_TOKEN}
                    '''
                }
            }
        }

        stage('Docker Build - Backend') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_BACKEND}:latest ."
            }
        }

        stage('Docker Build - Frontend') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_FRONTEND}:latest ."
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    docker save -o backend.tar ${DOCKER_IMAGE_BACKEND}:latest
                    docker save -o frontend.tar ${DOCKER_IMAGE_FRONTEND}:latest
                    docker run --rm -v $(pwd):/workspace aquasec/trivy:latest image --timeout 15m --exit-code 0 --severity HIGH,CRITICAL --input /workspace/backend.tar
                    docker run --rm -v $(pwd):/workspace aquasec/trivy:latest image --timeout 15m --exit-code 0 --severity HIGH,CRITICAL --input /workspace/frontend.tar
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh '''
                    echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin
                    docker push ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE_BACKEND}:latest
                    docker push ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE_FRONTEND}:latest
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'cp /home/udit/2ndSem/SPEProject/ansible/.vault_pass ansible/.vault_pass'
                sh 'ansible-playbook -i ansible/inventory ansible/deploy-k8s.yml --vault-password-file ansible/.vault_pass'
            }
        }
    }

    post {
        always {
            sh 'docker logout'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            mail to: 'admin@example.com', // Change this to your actual email address
                 subject: "SUCCESS: Healthcare Pipeline - Job '${env.JOB_NAME}' [${env.BUILD_NUMBER}]",
                 body: "Good news! The SPE Healthcare CI/CD pipeline completed successfully.\n\nYou can view the full console output here: ${env.BUILD_URL}"
        }
        failure {
            echo 'Pipeline failed!'
            mail to: 'admin@example.com', // Change this to your actual email address
                 subject: "FAILURE: Healthcare Pipeline - Job '${env.JOB_NAME}' [${env.BUILD_NUMBER}]",
                 body: "Uh oh! The SPE Healthcare CI/CD pipeline failed during execution.\n\nPlease check the console output to investigate the issue: ${env.BUILD_URL}"
        }
    }
}
