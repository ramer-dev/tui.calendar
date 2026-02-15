import { cloneElement, createElement } from 'preact';

import { useStore } from '@src/contexts/calendarStore';
import { cls } from '@src/helpers/css';
import { templateSelector } from '@src/selectors';
import type { TemplateName } from '@src/template/default';
import { sanitize } from '@src/utils/sanitizer';
import { isNil, isString } from '@src/utils/type';

import type { TemplateReturnType } from '@t/template';

interface Props {
  template: TemplateName;
  param?: any;
  as?: keyof HTMLElementTagNameMap;
}

export function Template({ template, param, as: tagName = 'div' }: Props) {
  const templates = useStore(templateSelector);
  const templateFunc: Function = templates[template];

  if (isNil(templateFunc)) {
    return null;
  }

  const htmlOrVnode: TemplateReturnType = templateFunc(param);

  if (isString(htmlOrVnode)) {
    return createElement(tagName, {
      className: cls(`template-${template}`),
      dangerouslySetInnerHTML: {
        __html: sanitize(htmlOrVnode),
      },
    });
  }

  // VNode가 아닌 경우 (객체 등) 문자열로 변환
  if (!htmlOrVnode || typeof htmlOrVnode !== 'object' || !('props' in htmlOrVnode)) {
    return createElement(tagName, {
      className: cls(`template-${template}`),
    }, String(htmlOrVnode ?? ''));
  }

  // VNode인 경우
  return cloneElement(htmlOrVnode, {
    className: `${htmlOrVnode.props?.className ?? ''} ${cls(`template-${template}`)}`,
  });
}
