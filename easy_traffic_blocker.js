// Easy Traffic Blocker v1.1
// 간단한 애드센스 무효 클릭 방지 스크립트
// 제작자: [본인 이름/블로그명]

(function() {
    // 기본 설정
    const defaultConfig = {
        maxClicks: 3,           // 최대 클릭 수
        resetTime: 1800000,     // 리셋 시간 (30분)
        warningMessage: "무효트래픽 연속 3번 초과하여 공격으로 간주하여 IP 추적을 진행합니다.",
        debug: true            // 디버깅 모드 활성화
    };

    // 클릭 카운터 관리자
    const clickManager = {
        get count() {
            return parseInt(localStorage.getItem('adClickCount') || '0');
        },
        set count(value) {
            localStorage.setItem('adClickCount', value.toString());
        },
        get lastClickTime() {
            return parseInt(localStorage.getItem('lastClickTime') || '0');
        },
        set lastClickTime(value) {
            localStorage.setItem('lastClickTime', value.toString());
        },
        reset() {
            this.count = 0;
            this.lastClickTime = Date.now();
        },
        increment() {
            this.count = this.count + 1;
            this.lastClickTime = Date.now();
            return this.count;
        },
        isBlocked() {
            return this.count > defaultConfig.maxClicks;
        },
        checkReset() {
            if (Date.now() - this.lastClickTime > defaultConfig.resetTime) {
                this.reset();
                return true;
            }
            return false;
        }
    };

    // 디버그 로그 함수
    function debugLog(message) {
        if (defaultConfig.debug) {
            console.log('[Traffic Blocker Debug]:', message);
        }
    }

    // 광고 요소 확인
    function isAdElement(element) {
        if (!element) return false;

        const tagName = element.tagName;
        const className = element.className || '';
        const id = element.id || '';
        const src = element.src || '';
        const adClient = element.getAttribute('data-ad-client') || '';

        // iframe 광고 체크
        if (tagName === 'IFRAME') {
            return src.includes('googleads') || 
                   src.includes('doubleclick') || 
                   id.startsWith('aswift_');
        }

        // ins 태그 광고 체크
        if (tagName === 'INS') {
            return className.includes('adsbygoogle') && 
                   adClient.includes('ca-pub-');
        }

        return false;
    }

    // 광고 클릭 처리
    function handleAdClick(event) {
        const element = event.target;
        let isAd = isAdElement(element);

        // 상위 요소에서 광고 찾기 (최대 5단계)
        if (!isAd) {
            let current = element.parentElement;
            let depth = 0;
            while (current && depth < 5) {
                if (isAdElement(current)) {
                    isAd = true;
                    break;
                }
                current = current.parentElement;
                depth++;
            }
        }

        // 광고 클릭이 아닌 경우 무시
        if (!isAd) return;

        debugLog('광고 클릭 감지됨');
        event.preventDefault();
        event.stopPropagation();

        // 시간 경과 체크 및 리셋
        if (clickManager.checkReset()) {
            debugLog('시간 초과로 카운터 리셋됨');
        }

        // 이미 차단된 상태 체크
        if (clickManager.isBlocked()) {
            debugLog('차단된 상태에서 클릭 시도');
            alert(defaultConfig.warningMessage);
            const blogUrl = window.easyTrafficBlockerConfig?.blogUrl || 'https://blog.naver.com';
            window.location.href = blogUrl;
            return;
        }

        // 클릭 카운트 증가
        const newCount = clickManager.increment();
        debugLog(`클릭 카운트 증가: ${newCount}`);

        // 클릭 제한 초과 체크
        if (newCount > defaultConfig.maxClicks) {
            debugLog('클릭 제한 초과');
            alert(defaultConfig.warningMessage);
            const blogUrl = window.easyTrafficBlockerConfig?.blogUrl || 'https://blog.naver.com';
            window.location.href = blogUrl;
            return;
        }

        // 클릭 카운트 업데이트 이벤트 발생
        window.dispatchEvent(new Event('adClickCountUpdate'));
    }

    // 광고 프레임 메시지 수신
    window.addEventListener('message', function(event) {
        if (event.data?.type === 'adsense_click') {
            debugLog('광고 프레임으로부터 클릭 감지');
            handleAdClick(event);
        }
    }, false);

    // 클릭 이벤트 리스너 등록
    document.addEventListener('click', handleAdClick, true);

    // 초기 상태 확인
    if (clickManager.isBlocked()) {
        debugLog('페이지 로드 시 이미 클릭이 차단된 상태입니다.');
    }

    // 스크립트 로드 완료
    debugLog('Easy Traffic Blocker가 설치되었습니다.');
})();