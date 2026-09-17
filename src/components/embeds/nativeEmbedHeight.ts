import { clampEmbedHeight } from '../../utils/embedHeight';

export const AUTO_HEIGHT_TOPIC = 'rsme-ah';

export const parseAutoHeightMessage = (data: unknown): number | undefined => {
  if (data == null) {
    return undefined;
  }
  let payload: unknown = data;
  if (typeof data === 'string') {
    try {
      payload = JSON.parse(data);
    } catch {
      return undefined;
    }
  }
  if (typeof payload !== 'object' || payload == null) {
    return undefined;
  }
  const record = payload as { topic?: unknown; height?: unknown };
  if (record.topic !== AUTO_HEIGHT_TOPIC || typeof record.height !== 'number') {
    return undefined;
  }
  return clampEmbedHeight(record.height);
};

/**
 * Same approach as @brown-bear/react-native-autoheight-webview:
 * wrap body contents, measure the wrapper, and re-run on mutations / delayed checks.
 * https://github.com/giannistolou/react-native-autoheight-webview
 */
export const nativeAutoHeightScript = `
  (function () {
    if (window.__rsmeAh) {
      return;
    }
    var topic = '${AUTO_HEIGHT_TOPIC}';

    function boot() {
      if (window.__rsmeAh || !document.body || !document.head) {
        return;
      }
      var lastHeight = 0;
      var heightTheSameTimes = 0;
      var maxHeightTheSameTimes = 5;
      var forceRefreshDelay = 1000;
      var forceRefreshTimeout;
      var checkPostMessageTimeout;

      if (!document.getElementById('rsme-ah-style')) {
        var styleElement = document.createElement('style');
        styleElement.id = 'rsme-ah-style';
        styleElement.innerHTML = 'html,body,#rsme-ah-wrapper{margin:0;padding:0;height:auto;min-height:0;}blockquote,.tiktok-embed,.instagram-media,.twitter-tweet,.fb-post,iframe{margin:0!important;}';
        document.head.appendChild(styleElement);
      }

      var wrapper = document.getElementById('rsme-ah-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'rsme-ah-wrapper';
        var child = document.body.firstChild;
        while (child) {
          var next = child.nextSibling;
          if (child.nodeName !== 'SCRIPT') {
            wrapper.appendChild(child);
          }
          child = next;
        }
        document.body.insertBefore(wrapper, document.body.firstChild);
      }

      var scheduled = 0;
      function updateSize() {
        if (document.fullscreenElement) {
          return;
        }
        if (!window.ReactNativeWebView || !window.ReactNativeWebView.postMessage) {
          checkPostMessageTimeout = setTimeout(updateSize, 200);
          return;
        }
        clearTimeout(checkPostMessageTimeout);
        var widget = wrapper.querySelector('.twitter-tweet,.instagram-media,.tiktok-embed,.fb-post');
        if (widget && wrapper.getElementsByTagName('iframe').length === 0) {
          clearTimeout(forceRefreshTimeout);
          forceRefreshTimeout = setTimeout(scheduleUpdate, 200);
          return;
        }
        var result = wrapper.getBoundingClientRect();
        var height = result.top > 0 ? result.height + result.top : result.height;
        if (!height) {
          height = wrapper.offsetHeight || document.documentElement.offsetHeight;
        }
        var iframes = wrapper.getElementsByTagName('iframe');
        for (var i = 0; i < iframes.length; i++) {
          var bottom = Math.ceil(iframes[i].getBoundingClientRect().bottom);
          if (bottom > height) {
            height = bottom;
          }
        }
        height = Math.ceil(height);
        if (height && height !== lastHeight) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ topic: topic, height: height }));
        }
        clearTimeout(forceRefreshTimeout);
        if (lastHeight !== height) {
          heightTheSameTimes = 1;
        } else {
          heightTheSameTimes++;
        }
        lastHeight = height;
        if (heightTheSameTimes <= maxHeightTheSameTimes) {
          forceRefreshTimeout = setTimeout(scheduleUpdate, heightTheSameTimes * forceRefreshDelay);
        }
      }
      function scheduleUpdate() {
        if (scheduled) {
          return;
        }
        scheduled = 1;
        setTimeout(function () {
          scheduled = 0;
          updateSize();
        }, 100);
      }

      window.addEventListener('load', scheduleUpdate);
      window.addEventListener('resize', scheduleUpdate);
      var Observer = window.MutationObserver || window.WebKitMutationObserver;
      if (Observer) {
        new Observer(scheduleUpdate).observe(wrapper, { childList: true, subtree: true, attributes: true });
      }
      updateSize();
      window.__rsmeAh = 1;
    }

    // Document-start injection has no body yet; wrapping then left auto-height dead.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
    true;
  })();
`;

export const injectAutoHeightScript = (html: string, script: string): string => {
  const tag = `<script>${script}</script>`;
  if (html.includes('</body>')) {
    return html.replace('</body>', `${tag}</body>`);
  }
  return `${html}${tag}`;
};
