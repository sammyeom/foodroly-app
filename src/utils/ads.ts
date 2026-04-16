import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { AD_GROUP_ID } from '../config/env';

export interface RewardedAdResult {
  rewarded: boolean;
}

/**
 * 리워드 전면광고를 로드 후 즉시 표시한다.
 * `userEarnedReward` 이벤트가 발생한 경우에만 `rewarded: true`로 resolve.
 *
 * AD_GROUP_ID가 비어있거나 현재 환경이 광고를 지원하지 않으면
 * 광고 없이 바로 보상 지급된 것으로 처리 (개발/심사 환경 대응).
 */
export function showRewardedAd(): Promise<RewardedAdResult> {
  if (!AD_GROUP_ID) {
    return Promise.resolve({ rewarded: true });
  }
  if (
    typeof loadFullScreenAd.isSupported === 'function' &&
    !loadFullScreenAd.isSupported()
  ) {
    return Promise.resolve({ rewarded: true });
  }
  if (
    typeof showFullScreenAd.isSupported === 'function' &&
    !showFullScreenAd.isSupported()
  ) {
    return Promise.resolve({ rewarded: true });
  }

  return new Promise<RewardedAdResult>((resolve) => {
    let earned = false;
    let settled = false;
    const settle = (result: RewardedAdResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    try {
      loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (loadEvt) => {
          if (loadEvt.type !== 'loaded') return;
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
        },
        onError: () => settle({ rewarded: false }),
      });
    } catch {
      settle({ rewarded: false });
    }
  });
}
