import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, 
  Linking, ScrollView, Dimensions, StatusBar, Alert, Modal 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
const { width } = Dimensions.get('window');

const COLORS = { 
  navy: '#002147', 
  gold: '#D4AF37', 
  white: '#FFFFFF', 
  paper: '#F4F4F0',
  muted: '#858580',
  deepDarkRed: '#550000',
  redAccent: '#E53935',
  greenSuccess: '#388E3C', // Cor para o botão do WhatsApp
};

const CATEGORIES = ["Tudo", "Camisas", "Copos", "Acessórios", "Ingressos"];

const PRODUTOS = [
  { 
    id: '1', cat: 'Camisas', nome: 'MANTO OFICIAL TITULAR 2026', 
    precoNormal: 249.90, precoSocio: 199.90,
    img: require('../assets/images/prod-01.png'), badge: 'LANÇAMENTO'
  },
  { 
    id: '2', cat: 'Camisas', nome: 'MANTO OFICIAL RESERVA', 
    precoNormal: 249.90, precoSocio: 199.90,
    img: require('../assets/images/prod-02.png'), badge: ''
  },
  { 
    id: '3', cat: 'Camisas', nome: 'CAMISA TREINO ATLETA', 
    precoNormal: 189.90, precoSocio: 149.90,
    img: require('../assets/images/prod-03.png'), badge: ''
  },
  { 
    id: '4', cat: 'Copos', nome: 'COPO STANLEY TSUNAMI', 
    precoNormal: 199.90, precoSocio: 159.90,
    img: require('../assets/images/prod-04.png'), badge: 'MAIS VENDIDO'
  },
  { 
    id: '5', cat: 'Copos', nome: 'COPO TÉRMICO BRANCO', 
    precoNormal: 189.90, precoSocio: 149.90,
    img: require('../assets/images/prod-05.png'), badge: ''
  },
  { 
    id: '6', cat: 'Acessórios', nome: 'BONÉ ABA CURVA PREMIUM', 
    precoNormal: 119.90, precoSocio: 89.90,
    img: require('../assets/images/prod-06.png'), badge: ''
  },
  { 
    id: '7', cat: 'Acessórios', nome: 'BONÉ ABA RETA NAVY', 
    precoNormal: 119.90, precoSocio: 89.90,
    img: require('../assets/images/prod-07.png'), badge: ''
  },
  { 
    id: '8', cat: 'Camisas', nome: 'CAMISA CASUAL FEMININA', 
    precoNormal: 149.90, precoSocio: 119.90,
    img: require('../assets/images/prod-08.png'), badge: 'NOVIDADE'
  },
  { 
    id: '9', cat: 'Acessórios', nome: 'MOCHILA ESPORTIVA', 
    precoNormal: 299.90, precoSocio: 239.90,
    img: require('../assets/images/prod-09.png'), badge: ''
  },
];

export default function LojaScreen() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("Tudo");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Função para adicionar ou remover produto do carrinho
  const toggleCartItem = (produto) => {
    const isAlreadyInCart = cart.find(item => item.id === produto.id);
    if (isAlreadyInCart) {
      setCart(cart.filter(item => item.id !== produto.id));
    } else {
      setCart([...cart, produto]);
    }
  };

  // Esvazia todo o carrinho de uma vez com confirmação
  const handleClearCart = () => {
    Alert.alert(
      "Esvaziar Carrinho?",
      "Deseja remover todos os itens do seu carrinho?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Esvaziar", style: "destructive", onPress: () => setCart([]) }
      ]
    );
  };

  // Calcula o total do carrinho baseando-se no preço mais barato para gerar valor na venda pelo zap
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.precoSocio, 0);
  };

  // Monta a mensagem final do WhatsApp
  const handleFinalCheckout = () => {
    let msgBody = `*NOVO PEDIDO: APP MARICÁ FC* 🌊\n\n`;
    msgBody += `Olá! Gostaria de encomendar os seguintes produtos:\n`;
    
    cart.forEach((item, index) => {
      msgBody += `\n${index + 1}. *${item.nome}* (R$ ${item.precoSocio.toFixed(2).replace('.', ',')})`;
    });

    msgBody += `\n\n*TOTAL:* R$ ${getCartTotal().toFixed(2).replace('.', ',')}\n`;
    msgBody += `\nSou Sócio Torcedor e gerei o pedido pelo App. Como procedemos com o pagamento/retirada?`;

    Linking.openURL(`https://wa.me/5521999999999?text=${encodeURIComponent(msgBody)}`);
  };

  const filteredProducts = activeCat === "Tudo" 
    ? PRODUTOS 
    : PRODUTOS.filter(p => p.cat === activeCat);

  const ProductCard = ({ item }) => {
    const isAdded = cart.find(cartItem => cartItem.id === item.id);

    return (
      <View style={styles.card}>
        {item.badge ? (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        ) : null}
        
        {/* Usando contain e adicionando padding interno para não cortar topo de copos etc */}
        <TouchableOpacity 
          style={styles.imgContainer} 
          onPress={() => setSelectedProduct(item)}
          activeOpacity={0.9}
        >
          <Image source={item.img} style={styles.img} resizeMode="contain" />
          <View style={styles.expandIcon}>
            <Ionicons name="expand" size={14} color={COLORS.muted} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.catLabel}>{item.cat.toUpperCase()}</Text>
          <Text style={styles.name} numberOfLines={2}>{item.nome}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.oldPrice}>R$ {item.precoNormal.toFixed(2).replace('.', ',')}</Text>
            <View style={styles.socioPriceBox}>
              <Ionicons name="star" size={10} color={COLORS.gold} />
              <Text style={styles.socioPrice}>R$ {item.precoSocio.toFixed(2).replace('.', ',')} Sócios</Text>
            </View>
          </View>

          {/* Botão Dinâmico Comprar / Adicionado */}
          <TouchableOpacity 
            style={[styles.buyBtn, isAdded && { backgroundColor: COLORS.gold }]} 
            onPress={() => toggleCartItem(item)}
            activeOpacity={0.8}
          >
            <Ionicons name={isAdded ? "checkmark-circle" : "cart"} size={16} color={isAdded ? COLORS.navy : COLORS.white} />
            <Text style={[styles.buyBtnText, isAdded && { color: COLORS.navy }]}>
              {isAdded ? "ADICIONADO" : "COMPRAR"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        
        {/* HERO BANNER SECTION */}
        <TouchableOpacity activeOpacity={0.9} style={styles.heroBanner}>
          <Image source={require('../assets/images/camisa.png')} style={styles.heroBg} resizeMode="cover" blurRadius={2} />
          <LinearGradient colors={['rgba(0,33,71,0.1)', 'rgba(0,33,71,0.9)']} style={styles.heroGradient}>
             <View style={styles.heroTag}><Text style={styles.heroTagText}>OFERTA EXCLUSIVA</Text></View>
             <Text style={styles.heroTitle}>Sócio Tsunami? Aproveite seus descontos na loja!</Text>
             <Text style={styles.heroSub}>Produtos oficiais com preços especiais para você.</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* HORIZONTAL CATEGORY FILTER */}
        <View style={styles.catScrollWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat, idx) => {
              const isActive = activeCat === cat;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.catTab, isActive && styles.catTabActive]}
                  onPress={() => setActiveCat(cat)}
                >
                  <Text style={[styles.catText, isActive && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* PRODUCT GRID */}
        <View style={styles.gridContainer}>
          {filteredProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </View>

        {/* ENDEREÇO DA LOJA FÍSICA NO RODAPÉ */}
        <View style={styles.footerStoreInfo}>
          <View style={styles.footerStoreHeaderRow}>
             <Ionicons name="storefront" size={24} color={COLORS.navy} />
             <Text style={styles.footerStoreTitle}>LOJA FÍSICA</Text>
          </View>
          <Text style={styles.footerStoreText}>
            <Text style={{fontWeight: '900', color: COLORS.deepDarkRed}}>Horário:</Text> Seg a Sex (09h-18h) | Sáb (09h-13h)
          </Text>
          <Text style={styles.footerStoreAddress}>
             Rodovia Amaral Peixoto, 25000, Itapeba.{'\n'}
             Ao lado da cafeteria Café ao Cubo.{'\n'}
             Maricá, RJ - 24914-440
          </Text>
        </View>

        {/* Espaço duplo pra caber tanto o Checkout Flutuante quanto a NavBar */}
        <View style={{ height: cart.length > 0 ? 190 : 130 }} />
      </ScrollView>

      {/* FIXED CHECKOUT BAR (Aparece se houver itens no carrinho) */}
      {cart.length > 0 && (
        <View style={styles.checkoutBarWrapper}>
          <View style={styles.checkoutBox}>
            <View style={styles.checkoutLeft}>
              <View style={styles.checkoutBage}>
                <Ionicons name="cart" size={14} color={COLORS.navy} />
                <Text style={styles.checkoutBageText}>{cart.length}</Text>
              </View>
              <View>
                <Text style={styles.checkoutTotalLabel}>TOTAL (SÓCIO)</Text>
                <Text style={styles.checkoutPriceText}>R$ {getCartTotal().toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.clearCartBtn} onPress={handleClearCart}>
                 <Ionicons name="trash-outline" size={20} color={COLORS.redAccent} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.checkoutBtn} onPress={handleFinalCheckout} activeOpacity={0.8}>
                 <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                 <Text style={styles.checkoutBtnText}>COMPRAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* MODAL DE IMAGEM AMPLIADA */}
      <Modal visible={!!selectedProduct} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseArea} 
            activeOpacity={1} 
            onPress={() => setSelectedProduct(null)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedProduct?.nome}</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <Ionicons name="close-circle" size={32} color={COLORS.navy} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalImageWrapper}>
              {selectedProduct && <Image source={selectedProduct.img} style={styles.modalImage} resizeMode="contain" />}
            </View>

            <View style={styles.modalFooter}>
               <Text style={styles.modalHint}>Em breve: Mais fotos e detalhes técnicos do produto.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollArea: { paddingBottom: 0 },
  
  heroBanner: { width: '100%', height: 230, backgroundColor: COLORS.navy, marginTop: 0 },
  heroBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.8 },
  heroGradient: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 20 },
  heroTag: { backgroundColor: COLORS.gold, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  heroTagText: { color: COLORS.navy, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: COLORS.white, fontSize: 28, fontWeight: '900', letterSpacing: 1, lineHeight: 32 },
  heroSub: { color: '#CCC', fontSize: 12, fontWeight: '500', marginTop: 5 },

  catScrollWrapper: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#EEE', elevation: 2, zIndex: 10 },
  catScroll: { paddingHorizontal: 15, paddingVertical: 10 },
  catTab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.paper, marginRight: 10 },
  catTabActive: { backgroundColor: COLORS.navy },
  catText: { fontSize: 11, fontWeight: '800', color: COLORS.muted },
  catTextActive: { color: COLORS.white },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'space-between' },
  card: { width: (width / 2) - 15, backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  badgeContainer: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.redAccent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, zIndex: 2 },
  badgeText: { color: COLORS.white, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  imgContainer: { height: 160, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', padding: 8, position: 'relative' },
  img: { width: '100%', height: '100%' },
  expandIcon: { position: 'absolute', bottom: 8, right: 8, opacity: 0.5 },
  
  infoContainer: { padding: 12, backgroundColor: '#F8F8F8' },
  catLabel: { fontSize: 8, fontWeight: '800', color: COLORS.muted, letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 11, fontWeight: '900', color: COLORS.navy, height: 32, lineHeight: 14 },
  
  priceContainer: { marginVertical: 8 },
  oldPrice: { fontSize: 10, color: COLORS.muted, textDecorationLine: 'line-through', fontWeight: '600' },
  socioPriceBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  socioPrice: { fontSize: 10, fontWeight: '900', color: '#AA7B18', marginLeft: 4 },
  
  buyBtn: { flexDirection: 'row', backgroundColor: COLORS.navy, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  buyBtnText: { color: COLORS.white, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginLeft: 6 },
  
  footerStoreInfo: { backgroundColor: COLORS.white, marginHorizontal: 15, borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, borderLeftWidth: 4, borderLeftColor: COLORS.gold },
  footerStoreHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  footerStoreTitle: { fontSize: 14, fontWeight: '900', color: COLORS.navy, marginLeft: 8, letterSpacing: 1 },
  footerStoreText: { fontSize: 11, color: COLORS.navy, marginBottom: 8 },
  footerStoreAddress: { fontSize: 11, color: COLORS.muted, lineHeight: 16 },

  checkoutBarWrapper: { position: 'absolute', bottom: 100, width: '100%', zIndex: 50 },
  checkoutBox: { flexDirection: 'row', backgroundColor: '#F8F1DA', height: 70, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 6, borderTopWidth: 1, borderTopColor: '#E6D39A' },
  checkoutLeft: { flexDirection: 'row', alignItems: 'center' },
  checkoutBage: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', marginRight: 15, elevation: 1 },
  checkoutBageText: { color: COLORS.navy, fontSize: 13, fontWeight: '900', marginLeft: 4 },
  checkoutTotalLabel: { fontSize: 9, color: '#886212', fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  checkoutPriceText: { color: COLORS.navy, fontSize: 16, fontWeight: '900' },
  
  clearCartBtn: { marginRight: 15, padding: 8, backgroundColor: 'rgba(229,57,53,0.1)', borderRadius: 8 },
  checkoutBtn: { flexDirection: 'row', backgroundColor: COLORS.greenSuccess, height: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, elevation: 2 },
  checkoutBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  navFix: { position: 'absolute', bottom: 0, width: '100%', height: 100, backgroundColor: 'transparent' },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,33,71,0.92)', justifyContent: 'center', alignItems: 'center' },
  modalCloseArea: { ...StyleSheet.absoluteFillObject },
  modalContent: { width: width - 20, backgroundColor: COLORS.white, borderRadius: 20, padding: 15, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  modalTitle: { fontSize: 14, fontWeight: '900', color: COLORS.navy, flex: 1, marginRight: 10 },
  modalImageWrapper: { width: '100%', height: width, backgroundColor: COLORS.white, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '95%', height: '95%' },
  modalFooter: { marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEE', alignItems: 'center' },
  modalHint: { fontSize: 10, color: COLORS.muted, fontWeight: '600' }
});
