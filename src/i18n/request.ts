import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
  // Sempre usar pt-BR como locale padrão
  const locale = 'pt-BR';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
