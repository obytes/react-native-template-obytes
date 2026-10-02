import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import colors from '@/components/ui/colors';
import { safeExternalUrl } from '@/features/member-content/lib/content-format';

type CircleMediaFrameProps = {
  fragment: string;
  testID: string;
  onOpenUrl?: (url: string) => void;
};

type ShouldStartRequest = {
  isTopFrame: boolean;
  url: string;
};

type OpenWindowEvent = {
  nativeEvent: { targetUrl: string };
};

function mediaDocument(fragment: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <meta http-equiv="Content-Security-Policy" content="default-src https: data: blob:; frame-src https:; img-src https: data: blob:; media-src https: blob:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'">
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${colors.surfaceContainer}; }
      iframe, video { border: 0; width: 100% !important; height: 100% !important; }
      img { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>${fragment}</body>
</html>`;
}

/**
 * Sandboxed WebView shared by embed (oEmbed iframe) and file (native uploaded
 * video) blocks: cookie-less, CSP-locked, and any top-frame navigation is
 * handed back to native code instead of loading inside the frame.
 */
export function CircleMediaFrame({ fragment, testID, onOpenUrl }: CircleMediaFrameProps) {
  const openExternal = React.useCallback((value: unknown) => {
    const url = safeExternalUrl(value);
    if (url && onOpenUrl)
      onOpenUrl(url);
  }, [onOpenUrl]);

  const shouldStart = React.useCallback((request: ShouldStartRequest) => {
    if (request.isTopFrame === false)
      return true;
    if (request.url === 'about:blank' || request.url.startsWith('data:text/html')) {
      return true;
    }
    openExternal(request.url);
    return false;
  }, [openExternal]);

  const onOpenWindow = React.useCallback((event: OpenWindowEvent) => {
    openExternal(event.nativeEvent.targetUrl);
  }, [openExternal]);

  return (
    <View style={styles.frame}>
      <WebView
        testID={testID}
        allowsInlineMediaPlayback
        cacheEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        mediaPlaybackRequiresUserAction
        nestedScrollEnabled={false}
        originWhitelist={['about:blank', 'https://*']}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        sharedCookiesEnabled={false}
        source={{ html: mediaDocument(fragment) }}
        style={styles.webView}
        onOpenWindow={onOpenWindow}
        onShouldStartLoadWithRequest={shouldStart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 220,
    overflow: 'hidden',
    width: '100%',
  },
  webView: {
    backgroundColor: colors.surfaceContainer,
    height: 220,
    width: '100%',
  },
});
