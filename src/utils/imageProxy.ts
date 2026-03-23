// src/utils/imageProxy.ts

/**
 * Função utilitária para contornar problemas de CORS em imagens
 * vindas de buckets do Firebase (exemplo: Vercel barrando a imagem).
 * O serviço publico wsrv.nl faz o proxy otimizando a resposta.
 */
export const getOptimizedImage = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  // Aplica o proxy APENAS para urls externas ou do firebase, não aplicável para base64 ou require locals.
  if (url.startsWith('http') && url.includes('firebasestorage')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
  }
  return url;
};
