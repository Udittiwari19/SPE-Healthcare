pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_IMAGE_BACKEND = 'udit/healthcare-backend'
        DOCKER_IMAGE_FRONTEND = 'udit/healthcare-frontend'
        SONARQUBE_TOKEN = credentials('sonarqube-token')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/udit/healthcare-devops.git'
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
                          -Dsonar.token=${SONARQUBE_TOKEN}
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
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE_BACKEND}:latest"
                sh "trivy image --exit-code 0 --severity HIGH,CRITICAL ${DOCKER_IMAGE_FRONTEND}:latest"
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
                sh '''
                    kubectl apply -f k8s/mysql-deployment.yaml
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    kubectl apply -f k8s/frontend-deployment.yaml
                '''
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
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
