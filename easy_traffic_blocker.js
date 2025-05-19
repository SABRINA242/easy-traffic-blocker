// 광고 클릭 차단 로직
class TrafficBlocker {
    constructor() {
        this.clickCount = 0;
        this.blockedCount = 0;
        this.allowedCount = 0;
        this.maxBlockedClicks = 3;
        this.initialize();
    }

    initialize() {
        // 문서 로드 완료 후 실행
        document.addEventListener('DOMContentLoaded', () => {
            this.setupClickHandler();
            this.setupAdDetection();
        });
    }

    setupClickHandler() {
        // 모든 클릭 이벤트 감지
        document.addEventListener('click', (event) => {
            this.clickCount++;
            
            // 클릭된 요소가 광고인지 확인
            if (this.isAdElement(event.target)) {
                event.preventDefault();
                event.stopPropagation();
                
                // 차단 횟수가 최대값을 넘었는지 확인
                if (this.blockedCount >= this.maxBlockedClicks) {
                    this.showAlertAndRedirect();
                    return false;
                }
                
                this.blockedCount++;
                console.log('광고 클릭 차단됨');
                return false;
            }
            
            this.allowedCount++;
            return true;
        }, true);
    }

    showAlertAndRedirect() {
        const alertMessage = document.getElementById('alert-message');
        alertMessage.style.display = 'block';
        alertMessage.textContent = '광고 클릭이 3번을 초과했습니다. 홈페이지로 이동합니다.';
        
        // 저장된 홈페이지 URL 가져오기
        const homepageUrl = localStorage.getItem('homepageUrl');
        if (homepageUrl) {
            // 2초 후 리디렉션
            setTimeout(() => {
                window.location.href = homepageUrl;
            }, 2000);
        } else {
            alertMessage.textContent = '홈페이지 주소가 설정되지 않았습니다.';
        }
    }

    setupAdDetection() {
        // AdSense 광고 감지
        const adSelectors = [
            '[data-ad-client]',
            '[data-ad-slot]',
            '.adsbygoogle',
            'ins.adsbygoogle',
            'iframe[src*="googleads"]',
            'iframe[src*="doubleclick"]'
        ];

        // 광고 요소에 마커 추가
        adSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.setAttribute('data-is-ad', 'true');
            });
        });

        // iframe 내부의 광고도 감지
        this.detectAdsInIframes();
    }

    isAdElement(element) {
        // 요소 자체가 광고인지 확인
        if (element.hasAttribute('data-is-ad')) {
            return true;
        }

        // 상위 요소들 중 광고가 있는지 확인
        let currentElement = element;
        while (currentElement && currentElement !== document.body) {
            if (currentElement.hasAttribute('data-is-ad')) {
                return true;
            }
            currentElement = currentElement.parentElement;
        }

        // href 속성이 광고 URL인지 확인
        if (element.tagName === 'A' && this.isAdUrl(element.href)) {
            return true;
        }

        return false;
    }

    isAdUrl(url) {
        const adDomains = [
            'googleads',
            'doubleclick',
            'googlesyndication',
            'adcr.naver.com'
        ];
        
        return adDomains.some(domain => url.includes(domain));
    }

    detectAdsInIframes() {
        // iframe 내부의 광고 감지
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const adElements = iframeDoc.querySelectorAll('[data-ad-client], [data-ad-slot], .adsbygoogle');
                adElements.forEach(element => {
                    element.setAttribute('data-is-ad', 'true');
                });
            } catch (e) {
                console.log('iframe 접근 제한:', e);
            }
        });
    }

    getStats() {
        return {
            totalClicks: this.clickCount,
            blockedClicks: this.blockedCount,
            allowedClicks: this.allowedCount
        };
    }
}

// 트래픽 차단기 인스턴스 생성
const trafficBlocker = new TrafficBlocker();

// 통계 출력 (테스트용)
setInterval(() => {
    console.log('클릭 통계:', trafficBlocker.getStats());
}, 5000); 