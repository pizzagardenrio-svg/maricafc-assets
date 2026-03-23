// src/utils/imageProxy.ts

/**
 * Função utilitária para contornar problemas de CORS em imagens
 * vindas de buckets do Firebase (exemplo: Vercel barrando a imagem).
 * O serviço publico wsrv.nl faz o proxy otimizando a resposta.
 */
export const getOptimizedImage = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  
  const cleanUrl = url.trim().replace(/\s/g, '%20');
  
  // Aplica o proxy APENAS para urls externas ou do firebase, não aplicável para base64 ou require locals.
  if (cleanUrl.startsWith('http') && cleanUrl.includes('firebasestorage')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&default=https://placehold.co/400`;
  }
  return cleanUrl;
};
