
'use client';
import { setFlushStyles } from '@gluestack-ui/nativewind-utils/flush';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';
import React, { useEffect, useLayoutEffect } from 'react';

import { config } from './config';
import { script } from './script';

const variableStyleTagId = 'nativewind-style';
const createStyle = (styleTagId: string) => {
  const style = document.createElement('style');
  style.id = styleTagId;
  style.appendChild(document.createTextNode(''));
  return style;
};

export const useSafeLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function GluestackUIProvider({
  mode = 'light',
  ...props
}: {
  mode?: 'light' | 'dark' | 'system';
  children?: React.ReactNode;
}) {
  const cssVariablesWithMode = generateCssVariablesWithMode();
  setFlushStyles(cssVariablesWithMode);

  const handleMediaQuery = React.useCallback((e: MediaQueryListEvent) => {
    script(e.matches ? 'dark' : 'light');
  }, []);

  useSafeLayoutEffect(() => {
    applyMode(mode);
  }, [mode]);

  useSafeLayoutEffect(() => {
    if (mode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addListener(handleMediaQuery);
      return () => media.removeListener(handleMediaQuery);
    }
  }, [handleMediaQuery]);

  useSafeLayoutEffect(() => {
    injectStyle(cssVariablesWithMode);
  }, []);

  return (
    <>
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `(${script.toString()})('${mode}')`,
        }}
      />
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </>
  );
}

function generateCssVariablesWithMode() {
  let cssVariablesWithMode = ``;
  Object.keys(config).forEach((configKey) => {
    cssVariablesWithMode +=
      configKey === 'dark' ? `\n .dark {\n ` : `\n:root {\n`;
    const cssVariables = Object.keys(
      config[configKey as keyof typeof config]
    ).reduce((acc: string, curr: string) => {
      acc += `${curr}:${config[configKey as keyof typeof config][curr]}; `;
      return acc;
    }, '');
    cssVariablesWithMode += `${cssVariables} \n}`;
  });
  return cssVariablesWithMode;
}

function applyMode(mode: 'light' | 'dark' | 'system') {
  if (mode !== 'system') {
    const documentElement = document.documentElement;
    if (documentElement) {
      documentElement.classList.add(mode);
      documentElement.classList.remove(mode === 'light' ? 'dark' : 'light');
      documentElement.style.colorScheme = mode;
    }
  }
}

function injectStyle(cssVariablesWithMode: string) {
  if (typeof window !== 'undefined') {
    const documentElement = document.documentElement;
    if (documentElement) {
      const head = documentElement.querySelector('head');
      let style = head?.querySelector(`[id='${variableStyleTagId}']`);
      if (!style) {
        style = createStyle(variableStyleTagId);
        style.innerHTML = cssVariablesWithMode;
        if (head) head.appendChild(style);
      }
    }
  }
}
