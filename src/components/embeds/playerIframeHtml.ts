import { escapeHtmlAttribute } from '../../utils/urls';

export const playerIframeHtml = ({
  src,
  allow,
  extraHead = '',
  extraIframeAttrs = '',
  title,
}: {
  src: string;
  allow: string;
  extraHead?: string;
  extraIframeAttrs?: string;
  title?: string;
}): string => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    ${extraHead}
    <style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#000;} iframe{margin:0;padding:0;width:100%;height:100%;border:0;}</style>
  </head>
  <body>
    <iframe src="${escapeHtmlAttribute(src)}" allow="${escapeHtmlAttribute(allow)}"${title ? ` title="${escapeHtmlAttribute(title)}"` : ''} ${extraIframeAttrs} allowfullscreen></iframe>
  </body>
</html>`;
