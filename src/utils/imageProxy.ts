// src/utils/imageProxy.ts

/**
 * Função utilitária para contornar problemas de CORS em imagens
 * vindas de buckets do Firebase (exemplo: Vercel barrando a imagem).
 * O serviço publico wsrv.nl faz o proxy otimizando a resposta.
 */
export const getOptimizedImage = (url: string | undefined | null) => {
  if (!url || !url.startsWith('http')) return url;
  // Usando o weserv.nl que é mais resiliente a URLs longas do Firebase
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=https://placehold.co`;
};
