// src/utils/imageProxy.ts

/**
 * Função utilitária para contornar problemas de CORS em imagens
 * vindas de buckets do Firebase (exemplo: Vercel barrando a imagem).
 * O serviço publico wsrv.nl faz o proxy otimizando a resposta.
 */
export const getOptimizedImage = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  
  try {
    // Decodifica primeiro para caso o Firebase já mande algo encodado, limpamos possíveis formatações prévias
    const decodedUrl = decodeURIComponent(url);
    const cleanUrl = decodedUrl.trim().replace(/\s/g, '%20');
    
    // Aplica o proxy APENAS para urls externas ou do firebase, não aplicável para base64 ou require locals.
    if (cleanUrl.startsWith('http') && cleanUrl.includes('firebasestorage')) {
      // wsrv.nl + webp leve (q=80) 
      return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&output=webp&q=80&default=https://placehold.co/400`;
    }
    return cleanUrl;
  } catch (error) {
    // Falback de segurança caso dê falha no Decode
    if (url.startsWith('http') && url.includes('firebasestorage')) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&q=80`;
    }
    return url;
  }
};
