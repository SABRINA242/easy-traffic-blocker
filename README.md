# Easy Traffic Blocker (애드센스 무효 클릭 방지)

간단하게 설치하는 애드센스 무효 클릭 방지 스크립트입니다.

## 특징
- 3회 연속 클릭 감지
- 30분 후 자동 리셋
- 무효 클릭 시 경고 메시지
- 자동 리다이렉션

## 설치 방법

1. 블로그/웹사이트의 `<head>` 태그 안에 아래 코드를 붙여넣으세요:

```html
<!-- 트래픽 방지 스크립트 설정 -->
<script>
    window.easyTrafficBlockerConfig = {
        blogUrl: "여기에_본인_블로그_주소를_넣으세요",  // 예: "https://example.com"
        maxClicks: 3,                  // 최대 클릭 수 (기본값: 3)
        resetTime: 1800000,           // 리셋 시간 (기본값: 30분)
        warningMessage: "무효트래픽 연속 3번 초과하여 공격으로 간주하여 IP 추적을 진행합니다.", // 경고 메시지
        debug: false                   // 디버그 모드 (기본값: false)
    };
</script>
<script src="https://cdn.jsdelivr.net/gh/[사용자명]/easy-traffic-blocker@1.0/easy_traffic_blocker.js"></script>
```

2. `blogUrl`에 본인의 블로그/웹사이트 주소를 입력하세요.

## 주의사항
- 스크립트는 반드시 `</head>` 태그 이전에 넣어주세요
- 본인의 블로그 주소를 정확하게 입력해주세요
- 애드센스가 설치된 페이지에만 적용됩니다

## 작동 방식
1. 애드센스 광고 클릭 감지
2. 30분 이내 3회 초과 클릭 시 경고
3. 설정된 블로그 주소로 리다이렉션

## 문의
문제가 있으시면 이슈를 등록해주세요. 