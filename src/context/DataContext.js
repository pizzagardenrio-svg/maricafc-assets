import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [maricaNews, setMaricaNews] = useState([]);
  const [loadingMarica, setLoadingMarica] = useState(true);
  const [cariocaNews, setCariocaNews] = useState([]);
  const [loadingCarioca, setLoadingCarioca] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- FUNÇÃO DE TEMPO RELATIVO ---
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'agora';
    const published = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - published) / (1000 * 60));
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} h`;
    return published.toLocaleDateString('pt-BR');
  };

  const fetchMaricaOfficialNews = async () => {
    try {
      const url = 'https://maricafutebolclube.com/wp-json/wp/v2/posts?per_page=6&_embed&_fields=title,link,date,_links,_embedded';
      const response = await fetch(url);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const parsedNews = data.map(post => {
          let imageUrl = null;
          if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            const media = post._embedded['wp:featuredmedia'][0];
            imageUrl = media.media_details?.sizes?.medium?.source_url || media.source_url;
          }
          return {
            title: post.title.rendered.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&#038;/g, "&"),
            link: post.link,
            pubDate: post.date,
            image_url: imageUrl
          };
        });
        setMaricaNews(parsedNews);
      }
    } catch (error) { 
      console.error("Erro Maricá FC WP Feed:", error.message); 
    } finally { 
      setLoadingMarica(false); 
    }
  };

  const fetchCariocaNews = async () => {
    try {
      const API_KEY = 'pub_2098c69ebef242cf8fd708ef6c87b935'; 
      const query = encodeURIComponent('"Campeonato Carioca" OR "Futebol do Rio"');
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${query}&language=pt&country=br`;
  
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === 'success' && data.results) {
        const uniqueArticles = data.results.filter((article, index, self) =>
          index === self.findIndex((t) => t.title.trim() === article.title.trim())
        );
        setCariocaNews(uniqueArticles.slice(0, 5)); 
      }
    } catch (error) { 
      console.error("Erro Feed Carioca:", error.message); 
    } finally { 
      setLoadingCarioca(false); 
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchMaricaOfficialNews(), fetchCariocaNews()]);
      setIsDataLoaded(true);
    };
    loadAll();
  }, []);

  return (
    <DataContext.Provider value={{
      maricaNews,
      loadingMarica,
      cariocaNews,
      loadingCarioca,
      isDataLoaded,
      formatTimeAgo,
      refreshData: () => {
        setLoadingMarica(true);
        setLoadingCarioca(true);
        fetchMaricaOfficialNews();
        fetchCariocaNews();
      }
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
