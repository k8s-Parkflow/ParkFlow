pipeline {
    agent {
        kubernetes {
            // Kaniko 빌드를 위한 전용 포드 템플릿
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - sleep
    args:
    - 999d
    volumeMounts:
    - name: kaniko-secret
      mountPath: /kaniko/.docker
  volumes:
  - name: kaniko-secret
    secret:
      secretName: dockerhub-secret
      items:
        - key: .dockerconfigjson
          path: config.json
"""
        }
    }

    environment {
        // 도커 허브 사용자 이름과 이미지 이름을 설정합니다.
        DOCKER_IMAGE = "hyungdongjo/parking-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                // GitHub에서 최신 소스 코드를 가져옵니다.
                checkout scm
            }
        }

        stage('Build and Push Image') {
            steps {
                container('kaniko') {
                    // Kaniko를 이용해 이미지를 빌드하고 도커 허브에 푸시합니다.
                    sh """
                    /kaniko/executor \
                      --context "${env.WORKSPACE}" \
                      --dockerfile Dockerfile \
                      --destination ${DOCKER_IMAGE}:v${env.BUILD_NUMBER} \
                      --destination ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Update Manifest') {
            steps {
                // 이 단계는 Git이 설치된 기본 에이전트 컨테이너에서 실행됩니다.
                script {
                    // 1. 배포 전용 레포지토리 클론
                    git credentialsId: 'github-token', 
                        url: 'https://github.com/k8s-Parkflow/Deploy.git'
                        branch: 'main'
                    
                    // 2. YAML 파일 내 이미지 태그를 현재 빌드 번호(v숫자)로 업데이트
                    // 파일 경로(frontend/...)가 실제 배포 레포 구조와 맞는지 확인 필수!
                    sh "sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:v${env.BUILD_NUMBER}|g' frontend/deployment.yaml"
                    
                    // 3. 변경 사항을 커밋하고 푸시 (신분증 설정 포함)
                    sh """
                        git config user.email "jenkins-bot@parkflow.local"
                        git config user.name "Jenkins-CI-Bot"
                        git add .
                        git commit -m "Deploy: frontend v${env.BUILD_NUMBER} [skip ci]" || echo "No changes to commit"
                        git push origin main
                    """
                }
            }
        }
    }

    post {
        success {
            echo "🎉 성공: 이미지가 푸시되었고 배포 레포지토리가 v${env.BUILD_NUMBER}로 업데이트되었습니다!"
        }
        failure {
            echo "❌ 실패: 파이프라인 실행 중 에러가 발생했습니다. 로그를 확인하세요."
            //이후 여기에 slack알림 웹훅을 추가한다.
        }
    }
}
