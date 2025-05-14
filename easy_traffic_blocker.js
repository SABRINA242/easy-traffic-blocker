// Easy Traffic Blocker v1.0
// 간단한 애드센스 무효 클릭 방지 스크립트
// 제작자: [본인 이름/블로그명]

(function() {
    // 기본 설정
    const defaultConfig = {
        maxClicks: 3,           // 최대 클릭 수
        resetTime: 1800000,     // 리셋 시간 (30분)
        warningMessage: "무효트래픽 공격으로 간주하여 IP 추적을 진행합니다.\n계속하시겠습니까?"
    };

    // 클릭 감지 및 처리
    function handleAdClick(e) {
        const element = e.target;
        
        // 애드센스 광고 체크
        if (!isAdsenseAd(element)) return;
        
        // 클릭 카운트 처리
        processClick();
    }

    // 애드센스 광고 요소 확인
    function isAdsenseAd(element) {
        if (!element) return false;
        
        // iframe 광고
        if (element.tagName === 'IFRAME' && element.src?.includes('google')) {
            return true;
        }
        
        // ins 태그 광고
        if (element.tagName === 'INS' && element.getAttribute('data-ad-client')?.includes('pub-')) {
            return true;
        }

        return false;
    }

    // 클릭 처리
    function processClick() {
        let clickCount = parseInt(localStorage.getItem('adClickCount') || '0');
        const lastClick = parseInt(localStorage.getItem('lastClickTime') || '0');
        const now = Date.now();

        // 시간 체크해서 리셋
        if (now - lastClick > defaultConfig.resetTime) {
            clickCount = 0;
        }

        // 클릭 수 증가
        clickCount++;
        
        // 상태 저장
        localStorage.setItem('adClickCount', clickCount);
        localStorage.setItem('lastClickTime', now);

        // 최대 클릭 수 체크
        if (clickCount > defaultConfig.maxClicks) {
            // 경고 메시지
            const userChoice = confirm(defaultConfig.warningMessage);
            
            // 블로그로 이동
            const blogUrl = window.easyTrafficBlockerConfig?.blogUrl || 'https://example.com';
            setTimeout(() => {
                window.location.href = blogUrl;
            }, 100);

            // 카운트 리셋
            localStorage.setItem('adClickCount', '0');
        }
    }

    // 이벤트 리스너 등록
    document.addEventListener('click', handleAdClick);
})();

// 스크립트 로드 완료
console.log('Easy Traffic Blocker가 설치되었습니다.'); 