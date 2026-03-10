pipeline {
    agent {
        kubernetes {
            // Kaniko 실행을 위한 포드 템플릿 정의
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
      secretName: dockerhub-secret # 미리 생성한 K8s Secret 이름
      items:
        - key: .dockerconfigjson
          path: config.json
"""
        }
    }

    environment {
        // 본인의 Docker Hub ID와 레포지토리 이름으로 수정하세요
        DOCKER_IMAGE = "doctor1006@naver.com/parkflow_front" 
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Push Image') {
            steps {
                container('kaniko') {
                    sh """
                    /kaniko/executor \
                      --context `pwd` \
                      --dockerfile Dockerfile \
                      --destination ${DOCKER_IMAGE}:${TAG} \
                      --destination ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }
}
