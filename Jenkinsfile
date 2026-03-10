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
        DOCKER_IMAGE = "hyungdongjo/parkflow_front"
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
                    // 공백이 없더라도 안전을 위해 WORKSPACE 경로를 따옴표로 감쌌습니다.
                    sh """
                    /kaniko/executor \
                      --context "${env.WORKSPACE}" \
                      --dockerfile Dockerfile \
                      --destination ${DOCKER_IMAGE}:${env.BUILD_NUMBER} \
                      --destination ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }
}
