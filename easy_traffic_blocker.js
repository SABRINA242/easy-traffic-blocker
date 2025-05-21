// 광고 클릭 차단 로직
class TrafficBlocker {
    constructor() {
        this.clickCount = 0;
        this.blockedCount = 0;
        this.allowedCount = 0;
        this.maxBlockedClicks = 3;
        
        // 즉시 초기화 실행
        this.initialize();
    }

    initialize() {
        // 문서가 이미 로드되었는지 확인
        if (document.readyState === 'loading') {
            // 아직 로드 중이면 DOMContentLoaded 이벤트 대기
            document.addEventListener('DOMContentLoaded', () => {
                this.setupClickHandler();
                this.setupAdDetection();
            });
        } else {
            // 이미 로드되었으면 바로 실행
            this.setupClickHandler();
            this.setupAdDetection();
        }

        // 동적으로 로드되는 광고를 감지하기 위한 MutationObserver 설정
        this.setupMutationObserver();
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let needsRecheck = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    needsRecheck = true;
                }
            });
            
            // 변경사항이 있을 때만 광고 감지 실행 (성능 최적화)
            if (needsRecheck) {
                this.setupAdDetection();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupClickHandler() {
        // 캡처링 단계에서 클릭 이벤트 처리
        document.addEventListener('click', (event) => {
            this.clickCount++;
            
            // 클릭된 요소가 광고인지 확인
            if (this.isAdElement(event.target)) {
                console.log('광고 요소 클릭 감지됨:', event.target);
                
                // 차단 횟수가 최대값을 넘었는지 확인
                if (this.blockedCount >= this.maxBlockedClicks) {
                    this.showAlertAndRedirect();
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
                
                this.blockedCount++;
                console.log(`광고 클릭 차단됨 (${this.blockedCount}/${this.maxBlockedClicks})`);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            
            this.allowedCount++;
            return true;
        }, true);
        
        // 버블링 단계에서도 이벤트 처리 (일부 광고는 캡처링으로 잡지 못할 수 있음)
        document.addEventListener('click', (event) => {
            if (this.isAdElement(event.target)) {
                console.log('버블링 단계에서 광고 클릭 감지됨');
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        }, false);
    }

    showAlertAndRedirect() {
        console.log('최대 광고 클릭 횟수 초과, 추적 및 리디렉션 준비 중...');
        
        // 사용자 IP 가져오기 (실제로는 작동하지 않지만 시각적 효과)
        const fakeIP = this.generateFakeIP();
        
        // 경고 모달 스타일을 정의하는 CSS 추가
        if (!document.getElementById('traffic-blocker-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'traffic-blocker-styles';
            styleElement.textContent = `
                .traffic-blocker-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.9);
                    z-index: 99999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .traffic-blocker-modal {
                    background-color: #111;
                    border: 2px solid #ff0000;
                    padding: 30px;
                    border-radius: 5px;
                    box-shadow: 0 0 20px rgba(255, 0, 0, 0.7);
                    max-width: 90%;
                    width: 500px;
                    text-align: center;
                    position: relative;
                    animation: pulse 1.5s infinite;
                }
                .traffic-blocker-title {
                    color: #ff0000;
                    font-size: 28px;
                    margin-bottom: 20px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    text-shadow: 0 0 5px #ff0000;
                }
                .traffic-blocker-message {
                    font-size: 18px;
                    color: #fff;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }
                .traffic-blocker-ip {
                    font-family: monospace;
                    background-color: #222;
                    padding: 10px;
                    border: 1px solid #333;
                    color: #ff0000;
                    font-size: 18px;
                    margin: 15px 0;
                    letter-spacing: 1px;
                }
                .traffic-blocker-timer {
                    font-weight: bold;
                    color: #ff0000;
                    font-size: 24px;
                    margin-top: 15px;
                    font-family: monospace;
                }
                .blink {
                    animation: blink 1s steps(1) infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.7); }
                    50% { box-shadow: 0 0 30px rgba(255, 0, 0, 1); }
                    100% { box-shadow: 0 0 20px rgba(255, 0, 0, 0.7); }
                }
                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .progress-track {
                    width: 100%;
                    height: 10px;
                    background-color: #333;
                    margin-top: 15px;
                    border-radius: 5px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    background-color: #ff0000;
                    width: 0%;
                    transition: width 1s linear;
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // 경고음 생성 및 재생
        const alertSound = new Audio("data:audio/wav;base64,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");
        alertSound.volume = 0.5;
        alertSound.play();
        
        // 기존 오버레이/모달 제거 (중복 방지)
        const existingOverlay = document.querySelector('.traffic-blocker-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // 오버레이 생성
        const overlay = document.createElement('div');
        overlay.className = 'traffic-blocker-overlay';
        
        // 모달 생성
        const modal = document.createElement('div');
        modal.className = 'traffic-blocker-modal';
        
        // 제목
        const title = document.createElement('div');
        title.className = 'traffic-blocker-title';
        title.textContent = '⚠️ 보안 경고 ⚠️';
        
        // 메시지
        const message = document.createElement('div');
        message.className = 'traffic-blocker-message';
        message.innerHTML = '<strong>광고 클릭 횟수 3회를 초과하였습니다.</strong><br>비정상적인 트래픽으로 판단되어 <strong>IP 감시 및 추적이 시작</strong>되었습니다.<br>시스템이 자동으로 홈페이지로 이동됩니다.';
        
        // IP 표시
        const ipDisplay = document.createElement('div');
        ipDisplay.className = 'traffic-blocker-ip';
        ipDisplay.textContent = `추적 IP: ${fakeIP}`;
        
        // 진행 상태 바
        const progressTrack = document.createElement('div');
        progressTrack.className = 'progress-track';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressTrack.appendChild(progressBar);
        
        // 타이머
        const timer = document.createElement('div');
        timer.className = 'traffic-blocker-timer blink';
        timer.textContent = '5초';
        
        // 요소들 조립
        modal.appendChild(title);
        modal.appendChild(message);
        modal.appendChild(ipDisplay);
        modal.appendChild(progressTrack);
        modal.appendChild(timer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 페이지 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 저장된 홈페이지 URL 가져오기
        const homepageUrl = localStorage.getItem('homepageUrl') || 'https://www.google.com';
        console.log(`${homepageUrl}로 리디렉션 예정(5초 후)`);
        
        // 카운트다운 타이머
        let secondsLeft = 5;
        progressBar.style.width = '0%';
        
        const countdown = setInterval(() => {
            secondsLeft--;
            // 진행 상태 바 업데이트
            progressBar.style.width = `${(5-secondsLeft) * 20}%`;
            
            if (secondsLeft <= 0) {
                clearInterval(countdown);
                // 리디렉션 실행
                if (!homepageUrl || homepageUrl === 'undefined') {
                    window.location.href = 'https://www.google.com';
                } else {
                    window.location.href = homepageUrl;
                }
            } else {
                timer.textContent = `${secondsLeft}초`;
            }
        }, 1000);
    }
    
    // 가짜 IP 생성 (시각적 효과용)
    generateFakeIP() {
        return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    }
    }

    setupAdDetection() {
        // AdSense 및 일반적인 광고 선택자
        const adSelectors = [
            '[data-ad-client]',
            '[data-ad-slot]',
            '.adsbygoogle',
            'ins.adsbygoogle',
            'iframe[src*="googleads"]',
            'iframe[src*="doubleclick"]',
            'iframe[src*="pagead"]',
            'iframe[src*="adservice"]',
            'div[id^="google_ads_iframe"]',
            'div[class*="adsbygoogle"]',
            'div[id*="div-gpt-ad"]',
            'div[class*="ad-container"]',
            'div[class*="ad-wrapper"]',
            'div[class*="ad-unit"]',
            'div[class*="advertisement"]',
            // 네이버 광고
            'iframe[src*="adcr.naver.com"]',
            'div[id*="nad_"]',
            // 카카오 광고 
            'iframe[src*="display.ad.daum.net"]',
            // 더 많은 광고 플랫폼 추가
            'iframe[src*="ad."]',
            'iframe[src*=".ad"]',
            'div[class*="banner"]'
        ];

        // 광고 요소에 마커 추가
        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`${selector} 선택자로 ${elements.length}개 광고 요소 발견`);
                }
                
                elements.forEach(element => {
                    element.setAttribute('data-is-ad', 'true');
                    
                    // 광고 시각적 표시 (디버깅용, 필요 시 주석 해제)
                    /*
                    element.style.border = '2px solid red';
                    const badge = document.createElement('div');
                    badge.textContent = 'AD';
                    badge.style.position = 'absolute';
                    badge.style.top = '0';
                    badge.style.right = '0';
                    badge.style.backgroundColor = 'red';
                    badge.style.color = 'white';
                    badge.style.padding = '2px 5px';
                    badge.style.fontSize = '10px';
                    badge.style.zIndex = '9999';
                    
                    if (element.style.position !== 'absolute' && element.style.position !== 'fixed') {
                        element.style.position = 'relative';
                    }
                    element.appendChild(badge);
                    */
                    
                    // 광고 컨테이너 내부의 모든 링크도 광고로 마킹
                    const links = element.querySelectorAll('a');
                    links.forEach(link => {
                        link.setAttribute('data-is-ad', 'true');
                    });
                });
            } catch (e) {
                console.error('광고 감지 중 오류:', e);
            }
        });

        // iframe 내부의 광고도 감지 시도
        this.detectAdsInIframes();
        
        // URL 기반 광고 링크 감지
        this.detectAdLinks();
    }
    
    detectAdLinks() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (this.isAdUrl(link.href)) {
                link.setAttribute('data-is-ad', 'true');
                console.log('광고 URL 링크 감지:', link.href);
            }
        });
    }

    isAdElement(element) {
        if (!element || !element.tagName) return false;
        
        // 요소 자체가 광고인지 확인
        if (element.hasAttribute('data-is-ad')) {
            return true;
        }

        // 상위 요소들 중 광고가 있는지 확인 (최대 5단계까지만 확인)
        let currentElement = element;
        let depth = 0;
        while (currentElement && currentElement !== document.body && depth < 5) {
            if (currentElement.hasAttribute('data-is-ad')) {
                return true;
            }
            currentElement = currentElement.parentElement;
            depth++;
        }

        // href 속성이 광고 URL인지 확인
        if (element.tagName === 'A' && this.isAdUrl(element.href)) {
            // 발견된 광고 링크에 마킹 추가
            element.setAttribute('data-is-ad', 'true');
            return true;
        }

        // 클래스나 ID에 광고 관련 키워드가 있는지 확인
        if (this.hasAdKeywords(element)) {
            // 키워드로 발견된 광고에 마킹 추가
            element.setAttribute('data-is-ad', 'true');
            return true;
        }

        return false;
    }

    hasAdKeywords(element) {
        if (!element.className && !element.id) return false;
        
        const adKeywords = [
            'ad',
            'ads',
            'advertisement',
            'advert',
            'sponsored',
            'promotion',
            'banner',
            'google_ads',
            'adsense'
        ];

        const classList = (element.className || '').toString().toLowerCase();
        const id = (element.id || '').toString().toLowerCase();

        return adKeywords.some(keyword => {
            // 단어 경계를 확인하여 'ad'가 'shadow'의 일부가 아니라 독립된 단어인지 확인
            const classRegex = new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`);
            const idRegex = new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`);
            
            return classRegex.test(classList) || idRegex.test(id);
        });
    }

    isAdUrl(url) {
        if (!url) return false;
        
        const adDomains = [
            'googleads',
            'doubleclick',
            'googlesyndication',
            'adcr.naver.com',
            'pagead',
            'adservice',
            'adform',
            'adnxs',
            'advertising',
            'sponsored',
            'display.ad.daum.net',
            '/ads/',
            '/ad/',
            'banner',
            'clicktrack'
        ];
        
        return adDomains.some(domain => url.toLowerCase().includes(domain));
    }

    detectAdsInIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                // iframe의 src가 광고 도메인을 포함하는지 확인
                if (this.isAdUrl(iframe.src)) {
                    iframe.setAttribute('data-is-ad', 'true');
                    console.log('광고 iframe 감지됨:', iframe.src);
                    return;
                }
                
                // Same-Origin Policy 제한으로 대부분 실패하겠지만 시도
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                    const adElements = iframeDoc.querySelectorAll(
                        '[data-ad-client], [data-ad-slot], .adsbygoogle, a[href*="googleads"], a[href*="doubleclick"]'
                    );
                    
                    if (adElements.length > 0) {
                        console.log(`iframe 내부에서 ${adElements.length}개 광고 요소 발견`);
                        iframe.setAttribute('data-is-ad', 'true');
                    }
                    
                    adElements.forEach(element => {
                        element.setAttribute('data-is-ad', 'true');
                    });
                }
            } catch (e) {
                // Same-Origin Policy 위반 오류는 예상된 것이므로 조용히 무시
                // console.log('iframe 접근 제한 (정상):', iframe.src);
                
                // src를 기반으로 광고 iframe인지 판단
                if (this.isAdUrl(iframe.src)) {
                    iframe.setAttribute('data-is-ad', 'true');
                }
            }
        });
    }

    getStats() {
        return {
            totalClicks: this.clickCount,
            blockedClicks: this.blockedCount,
            allowedClicks: this.allowedCount,
            maxAllowedAdClicks: this.maxBlockedClicks
        };
    }
    
    // 디버그 정보 출력
    printDebugInfo() {
        const adElements = document.querySelectorAll('[data-is-ad="true"]');
        console.log(`감지된 총 광고 요소: ${adElements.length}개`);
        console.log('광고 차단 통계:', this.getStats());
    }
}

// localStorage에 홈페이지 URL 설정 (테스트용, 실제로는 설정 페이지에서 설정)
if (!localStorage.getItem('homepageUrl')) {
    localStorage.setItem('homepageUrl', 'https://www.google.com');
    console.log('기본 홈페이지 URL이 설정되었습니다: https://www.google.com');
}

// 트래픽 차단기 인스턴스 생성
const trafficBlocker = new TrafficBlocker();

// 디버그 정보 출력 (5초 간격)
setInterval(() => {
    trafficBlocker.printDebugInfo();
}, 5000);

// 초기 광고 감지 로그
console.log('트래픽 차단기가 초기화되었습니다. 광고 감지 중...');