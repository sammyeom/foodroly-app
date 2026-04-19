import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { AD_GROUP_ID } from '../config/env';

export interface RewardedAdResult {
  rewarded: boolean;
}

let adReady = false;

function isAdSupported(): boolean {
  if (!AD_GROUP_ID) return false;
  if (
    typeof loadFullScreenAd.isSupported === 'function' &&
    !loadFullScreenAd.isSupported()
  ) {
    return false;
  }
  if (
    typeof showFullScreenAd.isSupported === 'function' &&
    !showFullScreenAd.isSupported()
  ) {
    return false;
  }
  return true;
}

/**
 * 리워드 전면광고를 사전 로딩한다.
 * 앱 마운트 시, 그리고 광고 시청 완료 후 호출하여 다음 광고를 미리 준비한다.
 */
export function preloadRewardedAd(): void {
  if (!isAdSupported()) return;
  adReady = false;
  try {
    loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (evt) => {
        if (evt.type === 'loaded') {
          adReady = true;
        }
      },
      onError: () => {
        adReady = false;
      },
    });
  } catch {
    adReady = false;
  }
}

/**
 * 사전 로딩된 리워드 전면광고를 표시한다.
 * 아직 로딩이 안 됐으면 로드 후 즉시 표시한다.
 * `userEarnedReward` 이벤트가 발생한 경우에만 `rewarded: true`로 resolve.
 *
 * AD_GROUP_ID가 비어있거나 현재 환경이 광고를 지원하지 않으면
 * 광고 없이 바로 보상 지급된 것으로 처리 (개발/심사 환경 대응).
 */
export function showRewardedAd(): Promise<RewardedAdResult> {
  if (!isAdSupported()) {
    return Promise.resolve({ rewarded: true });
  }

  return new Promise<RewardedAdResult>((resolve) => {
    let earned = false;
    let settled = false;
    const settle = (result: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      // 다음 광고를 미리 로딩
      preloadRewardedAd();
      resolve(result);
    };

    const doShow = () => {
      adReady = false;
      try {
        showFullScreenAd({
          options: { adGroupId: AD_GROUP_ID },
          onEvent: (showEvt) => {
            if (showEvt.type === 'userEarnedReward') {
              earned = true;
              return;
            }
            if (showEvt.type === 'dismissed' || showEvt.type === 'failedToShow') {
              settle({ rewarded: earned });
            }
          },
          onError: () => settle({ rewarded: earned }),
        });
      } catch {
        settle({ rewarded: false });
      }
    };

    if (adReady) {
      doShow();
    } else {
      // 사전 로딩이 안 된 경우 fallback: 로드 후 표시
      try {
        loadFullScreenAd({
          options: { adGroupId: AD_GROUP_ID },
          onEvent: (loadEvt) => {
            if (loadEvt.type === 'loaded') {
              doShow();
            }
          },
          onError: () => settle({ rewarded: false }),
        });
      } catch {
        settle({ rewarded: false });
      }
    }
  });
}
