import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { db } from "../../src/config/firebase";
import { useAuth } from "../../src/context/AuthContext";
import { AppTheme, useTheme } from "../../src/theme/desingSystem";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeaturedPlantCard {
  name: string;
  gradientColors: readonly [string, string];
}

interface StoreData {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: string;
  hours: string;
  gradientColors: readonly [string, string];
  featuredPlants: FeaturedPlantCard[];
}

interface MarketplaceListing {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  ownerId: string;
  ownerName: string;
  ownerImage: string;
  estado: "disponible" | "vendida";
  contactoTipo: "whatsapp" | "email";
  contacto: string;
  createdAt: unknown;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = "#4ade80";

const STORES: StoreData[] = [
  {
    id: "1",
    name: "Vivero La Ceiba",
    description:
      "Especialistas en plantas tropicales y ornamentales. Más de 500 variedades disponibles en nuestro vivero en San José.",
    category: "Tropical",
    rating: 4.8,
    reviewCount: 124,
    distance: "1.2 km",
    hours: "Lun–Sáb 8:00–17:00",
    gradientColors: ["#0f2a0f", "#1f5c2a"],
    featuredPlants: [
      { name: "Heliconia", gradientColors: ["#7c2d12", "#ea580c"] },
      { name: "Anthurium", gradientColors: ["#831843", "#db2777"] },
      { name: "Monstera", gradientColors: ["#14532d", "#22c55e"] },
      { name: "Bromelia", gradientColors: ["#7f1d1d", "#dc2626"] },
    ],
  },
  {
    id: "2",
    name: "Jardines del Valle",
    description:
      "Especialistas en jardines paisajistas y plantas de interior. Servicio de diseño personalizado.",
    category: "Ornamental",
    rating: 4.6,
    reviewCount: 89,
    distance: "2.3 km",
    hours: "Lun–Dom 9:00–18:00",
    gradientColors: ["#1a2e0a", "#3d6b1f"],
    featuredPlants: [
      { name: "Rosa", gradientColors: ["#831843", "#ec4899"] },
      { name: "Orquídea", gradientColors: ["#4c1d95", "#8b5cf6"] },
      { name: "Begonia", gradientColors: ["#7c2d12", "#f97316"] },
      { name: "Lavanda", gradientColors: ["#4c1d95", "#7c3aed"] },
    ],
  },
  {
    id: "3",
    name: "Plantas Tropicales CR",
    description:
      "La mayor selección de plantas tropicales nativas de Costa Rica. Envíos a todo el país.",
    category: "Nativas",
    rating: 4.9,
    reviewCount: 203,
    distance: "3.8 km",
    hours: "Lun–Sáb 7:30–16:30",
    gradientColors: ["#042f2e", "#0f766e"],
    featuredPlants: [
      { name: "Guaria Morada", gradientColors: ["#4c1d95", "#8b5cf6"] },
      { name: "Palma Real", gradientColors: ["#14532d", "#16a34a"] },
      { name: "Heliconias", gradientColors: ["#7c2d12", "#ea580c"] },
      { name: "Bromelias", gradientColors: ["#7f1d1d", "#dc2626"] },
    ],
  },
  {
    id: "4",
    name: "El Vergel Botánico",
    description:
      "Centro botánico especializado en plantas medicinales, aromáticas y suculentas raras.",
    category: "Medicinal",
    rating: 4.7,
    reviewCount: 67,
    distance: "4.1 km",
    hours: "Mar–Dom 9:00–17:00",
    gradientColors: ["#1a1f0d", "#3d5c1a"],
    featuredPlants: [
      { name: "Aloe Vera", gradientColors: ["#14532d", "#22c55e"] },
      { name: "Lavanda", gradientColors: ["#4c1d95", "#7c3aed"] },
      { name: "Romero", gradientColors: ["#1e3a5f", "#3b82f6"] },
      { name: "Menta", gradientColors: ["#064e3b", "#10b981"] },
    ],
  },
  {
    id: "5",
    name: "Verde Vivo",
    description:
      "Vivero urbano con enfoque en plantas para apartamentos, oficinas y espacios pequeños.",
    category: "Interior",
    rating: 4.5,
    reviewCount: 156,
    distance: "0.8 km",
    hours: "Lun–Sáb 9:00–19:00",
    gradientColors: ["#0a2a0a", "#1f5c1f"],
    featuredPlants: [
      { name: "Pothos", gradientColors: ["#14532d", "#22c55e"] },
      { name: "Sansevieria", gradientColors: ["#1a2e0a", "#4d7c0f"] },
      { name: "ZZ Plant", gradientColors: ["#1a1a0a", "#713f12"] },
      { name: "Ficus Lyrata", gradientColors: ["#1c1917", "#57534e"] },
    ],
  },
];

const CATEGORY_FILTERS = [
  "Todos", "Interior", "Tropical", "Suculenta", "Aromática", "Cactus", "Frutal",
];

const LISTING_CATEGORIES = [
  "Interior", "Tropical", "Suculenta", "Aromática", "Cactus", "Frutal", "Ornamental",
];

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons
          key={s}
          name={s <= Math.round(rating) ? "star" : "star-outline"}
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ─── MarketplaceScreen ────────────────────────────────────────────────────────

export default function MarketplaceScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { user: authUser } = useAuth();

  const storeSheetRef = useRef<BottomSheet>(null);
  const addSheetRef = useRef<BottomSheet>(null);
  const storeSnapPoints = useMemo(() => ["88%"], []);
  const addSnapPoints = useMemo(() => ["78%"], []);

  const [activeTab, setActiveTab] = useState<"tiendas" | "plantas">("tiendas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [addImage, setAddImage] = useState<string | null>(null);
  const [addNombre, setAddNombre] = useState("");
  const [addPrecio, setAddPrecio] = useState("");
  const [addDescripcion, setAddDescripcion] = useState("");
  const [addCategoria, setAddCategoria] = useState("");
  const [addContactoTipo, setAddContactoTipo] = useState<"whatsapp" | "email">("whatsapp");
  const [addContacto, setAddContacto] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const filteredStores = useMemo(() => {
    if (!searchQuery) return STORES;
    const q = searchQuery.toLowerCase();
    return STORES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "Todos" || l.categoria === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const q = query(
        collection(db, "marketplace"),
        where("estado", "==", "disponible"),
        limit(20)
      );
      const snap = await getDocs(q);
      const data: MarketplaceListing[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<MarketplaceListing, "id">),
      }));
      setListings(data);
    } catch (e) {
      console.error("Error fetching marketplace listings:", e);
    } finally {
      setListingsLoading(false);
    }
  };

  const openStoreDetail = (store: StoreData) => {
    setSelectedStore(store);
    storeSheetRef.current?.expand();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAddImage(result.assets[0].uri);
    }
  };

  const resetAddForm = () => {
    setAddImage(null);
    setAddNombre("");
    setAddPrecio("");
    setAddDescripcion("");
    setAddCategoria("");
    setAddContactoTipo("whatsapp");
    setAddContacto("");
  };

  const handlePublish = async () => {
    if (!addNombre.trim() || !addPrecio || !addCategoria || !addContacto.trim()) return;
    const precioNum = parseFloat(addPrecio);
    if (isNaN(precioNum)) return;
    setAddSaving(true);
    try {
      await addDoc(collection(db, "marketplace"), {
        nombre: addNombre.trim(),
        descripcion: addDescripcion.trim(),
        precio: precioNum,
        categoria: addCategoria,
        imagen: addImage || "",
        ownerId: authUser?.uid || "",
        ownerName: authUser?.displayName || "Usuario",
        ownerImage: authUser?.photoURL || "",
        estado: "disponible",
        contactoTipo: addContactoTipo,
        contacto: addContacto.trim(),
        createdAt: serverTimestamp(),
      });
      addSheetRef.current?.close();
      resetAddForm();
      fetchListings();
    } catch (e) {
      console.error("Error publishing listing:", e);
    } finally {
      setAddSaving(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: unknown) => (
      <BottomSheetBackdrop
        {...(props as object)}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const isPublishDisabled =
    !addNombre.trim() || !addPrecio || !addCategoria || !addContacto.trim() || addSaving;

  const featuredStore = STORES[0];

  // ── Listing card renderer ─────────────────────────────────────────────────

  const renderListingCard = (listing: MarketplaceListing) => (
    <View key={listing.id} style={styles.listingCard}>
      <View style={styles.listingImageWrap}>
        {listing.imagen ? (
          <Image source={{ uri: listing.imagen }} style={styles.listingImage} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={["#0f2a0f", "#1f5c2a"]}
            style={styles.listingImage}
          />
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>₡{listing.precio.toLocaleString()}</Text>
        </View>
        {listing.estado === "vendida" && (
          <View style={styles.soldOverlay}>
            <View style={styles.soldBadge}>
              <Text style={styles.soldBadgeText}>Vendida</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.listingContent}>
        <Text style={styles.listingName} numberOfLines={1}>{listing.nombre}</Text>
        <Text style={styles.listingDesc} numberOfLines={2}>{listing.descripcion}</Text>

        <View style={styles.sellerRow}>
          {listing.ownerImage ? (
            <Image source={{ uri: listing.ownerImage }} style={styles.sellerAvatar} />
          ) : (
            <View style={[styles.sellerAvatar, styles.sellerAvatarFallback]}>
              <Ionicons name="person" size={11} color={theme.colors.textSecondary} />
            </View>
          )}
          <Text style={styles.sellerName} numberOfLines={1}>{listing.ownerName}</Text>
        </View>

        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => {
            if (listing.contactoTipo === "whatsapp") {
              Linking.openURL(`whatsapp://send?phone=${listing.contacto}`);
            } else {
              Linking.openURL(`mailto:${listing.contacto}`);
            }
          }}
        >
          <Text style={styles.contactBtnText}>Contactar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
      />

      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="options-outline" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={16}
            color={theme.colors.textSecondary}
            style={{ marginLeft: 14, marginRight: 8 }}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Buscar plantas, tiendas..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ paddingRight: 14 }}>
              <Ionicons name="close-circle" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION TABS */}
        <View style={styles.tabContainer}>
          {(["tiendas", "plantas"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                ]}
              >
                {tab === "tiendas" ? "Tiendas Locales" : "Plantas de Usuarios"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TAB A: TIENDAS LOCALES ── */}
        {activeTab === "tiendas" && (
          <View>
            {/* Featured store banner */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.featuredBanner}
              onPress={() => openStoreDetail(featuredStore)}
            >
              <LinearGradient
                colors={featuredStore.gradientColors}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.75)"]}
                style={styles.featuredOverlay}
              />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>Destacada</Text>
                </View>
                <Text style={styles.featuredName}>{featuredStore.name}</Text>
                <View style={styles.featuredRatingRow}>
                  <Stars rating={featuredStore.rating} size={12} />
                  <Text style={styles.featuredRatingText}>
                    {featuredStore.rating} · {featuredStore.reviewCount} reseñas
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Stores list */}
            <View style={styles.storesList}>
              {filteredStores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  activeOpacity={0.88}
                  style={styles.storeCard}
                  onPress={() => openStoreDetail(store)}
                >
                  <LinearGradient
                    colors={store.gradientColors}
                    style={styles.storeCardImage}
                  />
                  <View style={styles.storeCardContent}>
                    <Text style={styles.storeCardName}>{store.name}</Text>
                    <Text style={styles.storeCardDesc} numberOfLines={2}>{store.description}</Text>
                    <View style={styles.storeCardBottom}>
                      <View style={styles.storeRatingRow}>
                        <Stars rating={store.rating} />
                        <Text style={styles.storeRatingText}>{store.rating}</Text>
                      </View>
                      <View style={styles.storeDistChip}>
                        <Ionicons name="location-outline" size={11} color={theme.colors.textSecondary} />
                        <Text style={styles.storeDistText}>{store.distance}</Text>
                      </View>
                      <Text style={styles.storeLink}>Ver tienda →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── TAB B: PLANTAS DE USUARIOS ── */}
        {activeTab === "plantas" && (
          <View>
            {/* Category filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {CATEGORY_FILTERS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterChip,
                    categoryFilter === cat && styles.filterChipActive,
                  ]}
                  onPress={() => setCategoryFilter(cat)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      categoryFilter === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Listings */}
            {listingsLoading ? (
              <ActivityIndicator
                color={PRIMARY}
                style={{ marginTop: 40 }}
              />
            ) : filteredListings.length > 0 ? (
              <View style={styles.listingsGrid}>
                <View style={styles.gridCol}>
                  {filteredListings
                    .filter((_, i) => i % 2 === 0)
                    .map(renderListingCard)}
                </View>
                <View style={styles.gridCol}>
                  {filteredListings
                    .filter((_, i) => i % 2 !== 0)
                    .map(renderListingCard)}
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="storefront-outline" size={48} color={theme.colors.disabledText} />
                <Text style={styles.emptyTitle}>Aún no hay plantas en venta</Text>
                <Text style={styles.emptySub}>Sé el primero en publicar</Text>
                <TouchableOpacity
                  onPress={() => addSheetRef.current?.expand()}
                  style={{ marginTop: 12 }}
                >
                  <Text style={styles.emptyLink}>Publicar ahora</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      {activeTab === "plantas" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => addSheetRef.current?.expand()}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      )}

      {/* ── STORE DETAIL BOTTOM SHEET ── */}
      <BottomSheet
        ref={storeSheetRef}
        index={-1}
        snapPoints={storeSnapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableHandlePanningGesture
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      >
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {selectedStore && (
            <View>
              {/* Store banner */}
              <View style={styles.sheetBanner}>
                <LinearGradient
                  colors={selectedStore.gradientColors}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.75)"]}
                  style={styles.sheetBannerOverlay}
                />
                <Text style={styles.sheetStoreName}>{selectedStore.name}</Text>
              </View>

              <View style={styles.sheetBody}>
                {/* Rating + category */}
                <View style={styles.sheetMetaRow}>
                  <Stars rating={selectedStore.rating} size={13} />
                  <Text style={styles.sheetRatingText}>
                    {selectedStore.rating} · {selectedStore.reviewCount} reseñas
                  </Text>
                  <View style={styles.sheetCategoryChip}>
                    <Text style={styles.sheetCategoryText}>{selectedStore.category}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.sheetDesc}>{selectedStore.description}</Text>

                {/* Hours */}
                <View style={styles.sheetHoursRow}>
                  <Ionicons name="time-outline" size={15} color={theme.colors.textSecondary} />
                  <Text style={styles.sheetHoursText}>{selectedStore.hours}</Text>
                </View>

                {/* Maps button */}
                <TouchableOpacity
                  style={styles.mapsBtn}
                  onPress={() =>
                    Linking.openURL(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        selectedStore.name + " Costa Rica"
                      )}`
                    )
                  }
                >
                  <Ionicons name="map-outline" size={18} color={PRIMARY} />
                  <Text style={styles.mapsBtnText}>Abrir en Google Maps</Text>
                </TouchableOpacity>

                {/* Featured plants */}
                <Text style={styles.sheetSectionTitle}>Plantas destacadas</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
                >
                  {selectedStore.featuredPlants.map((plant) => (
                    <View key={plant.name} style={styles.plantMiniCard}>
                      <LinearGradient
                        colors={plant.gradientColors}
                        style={StyleSheet.absoluteFill}
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.7)"]}
                        style={styles.plantMiniOverlay}
                      />
                      <Text style={styles.plantMiniName}>{plant.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* ── ADD LISTING BOTTOM SHEET ── */}
      <BottomSheet
        ref={addSheetRef}
        index={-1}
        snapPoints={addSnapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableHandlePanningGesture
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.addSheetContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Sheet header */}
          <View style={styles.addSheetHeader}>
            <Text style={styles.addSheetTitle}>Nueva publicación</Text>
            <TouchableOpacity
              style={styles.addSheetClose}
              onPress={() => {
                addSheetRef.current?.close();
                resetAddForm();
              }}
            >
              <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Image picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {addImage ? (
              <Image source={{ uri: addImage }} style={styles.imagePickerPreview} resizeMode="cover" />
            ) : (
              <View style={styles.imagePickerEmpty}>
                <Ionicons name="camera-outline" size={28} color={theme.colors.textSecondary} />
                <Text style={styles.imagePickerText}>Agregar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Nombre */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Nombre de la planta</Text>
            <View style={styles.inputRow}>
              <Ionicons name="leaf-outline" size={16} color={theme.colors.textSecondary} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="Ej. Monstera Deliciosa"
                placeholderTextColor={theme.colors.disabledText}
                value={addNombre}
                onChangeText={setAddNombre}
              />
            </View>
          </View>

          {/* Precio */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Precio</Text>
            <View style={styles.inputRow}>
              <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>₡</Text>
              <BottomSheetTextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder="0"
                placeholderTextColor={theme.colors.disabledText}
                keyboardType="numeric"
                value={addPrecio}
                onChangeText={setAddPrecio}
              />
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Descripción</Text>
            <View style={[styles.inputRow, styles.inputRowMulti]}>
              <BottomSheetTextInput
                style={[styles.input, styles.inputMulti, { color: theme.colors.textPrimary }]}
                placeholder="Describe tu planta..."
                placeholderTextColor={theme.colors.disabledText}
                multiline
                numberOfLines={3}
                value={addDescripcion}
                onChangeText={setAddDescripcion}
              />
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Categoría</Text>
            <View style={styles.chipsWrap}>
              {LISTING_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, addCategoria === cat && styles.catChipActive]}
                  onPress={() => setAddCategoria(cat)}
                >
                  <Text style={[styles.catChipText, addCategoria === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tipo de contacto */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Tipo de contacto</Text>
            <View style={styles.contactToggle}>
              {(["whatsapp", "email"] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.toggleBtn, addContactoTipo === tipo && styles.toggleBtnActive]}
                  onPress={() => setAddContactoTipo(tipo)}
                >
                  <Ionicons
                    name={tipo === "whatsapp" ? "logo-whatsapp" : "mail-outline"}
                    size={14}
                    color={addContactoTipo === tipo ? PRIMARY : theme.colors.textSecondary}
                  />
                  <Text style={[styles.toggleText, addContactoTipo === tipo && styles.toggleTextActive]}>
                    {tipo === "whatsapp" ? "WhatsApp" : "Email"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contacto */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              {addContactoTipo === "whatsapp" ? "Número de WhatsApp" : "Correo electrónico"}
            </Text>
            <View style={styles.inputRow}>
              <Ionicons
                name={addContactoTipo === "whatsapp" ? "logo-whatsapp" : "mail-outline"}
                size={16}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <BottomSheetTextInput
                style={[styles.input, { color: theme.colors.textPrimary }]}
                placeholder={addContactoTipo === "whatsapp" ? "+506 8888-8888" : "correo@ejemplo.com"}
                placeholderTextColor={theme.colors.disabledText}
                keyboardType={addContactoTipo === "whatsapp" ? "phone-pad" : "email-address"}
                autoCapitalize="none"
                value={addContacto}
                onChangeText={setAddContacto}
              />
            </View>
          </View>

          {/* Publish button */}
          <TouchableOpacity
            style={[styles.publishBtn, isPublishDisabled && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={isPublishDisabled}
          >
            {addSaving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.publishBtnText}>Publicar planta</Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    headerBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.backgroundChip,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: "300",
      color: theme.colors.textPrimary,
      marginLeft: 12,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    // Scroll
    scroll: { flex: 1 },
    scrollContent: { paddingTop: 4 },
    // Search bar
    searchBar: {
      marginHorizontal: 20,
      marginTop: 16,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundChip,
      flexDirection: "row",
      alignItems: "center",
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      height: "100%",
    },
    // Tabs
    tabContainer: {
      marginHorizontal: 20,
      marginTop: 16,
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabButton: {
      flex: 1,
      paddingBottom: 12,
      alignItems: "center",
    },
    tabButtonActive: {
      borderBottomWidth: 2,
      borderBottomColor: PRIMARY,
    },
    tabText: { fontSize: 14 },
    tabTextActive: { fontWeight: "500", color: theme.colors.textPrimary },
    tabTextInactive: { color: theme.colors.textSecondary },
    // Featured store
    featuredBanner: {
      marginHorizontal: 20,
      marginTop: 16,
      height: 160,
      borderRadius: 20,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    featuredOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 100,
    },
    featuredContent: {
      padding: 16,
      gap: 6,
    },
    featuredBadge: {
      alignSelf: "flex-start",
      backgroundColor: PRIMARY,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    featuredBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#000",
    },
    featuredName: {
      fontSize: 18,
      fontWeight: "500",
      color: "#fff",
    },
    featuredRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    featuredRatingText: {
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
    },
    // Stores list
    storesList: {
      marginTop: 16,
      gap: 12,
      paddingHorizontal: 20,
    },
    storeCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      padding: 14,
      flexDirection: "row",
      gap: 12,
      shadowColor: theme.shadows.card.color,
      shadowOpacity: theme.shadows.card.opacity,
      shadowRadius: theme.shadows.card.radius,
      shadowOffset: theme.shadows.card.offset,
      elevation: theme.shadows.card.elevation,
    },
    storeCardImage: {
      width: 70,
      height: 70,
      borderRadius: 12,
    },
    storeCardContent: { flex: 1 },
    storeCardName: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.textPrimary,
    },
    storeCardDesc: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
    },
    storeCardBottom: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 8,
    },
    storeRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    storeRatingText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    storeDistChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      backgroundColor: theme.colors.backgroundChip,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    storeDistText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    storeLink: {
      marginLeft: "auto",
      fontSize: 12,
      color: PRIMARY,
    },
    // Category filter chips
    categoryScroll: { marginTop: 16 },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: PRIMARY,
      borderColor: PRIMARY,
    },
    filterChipText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    filterChipTextActive: {
      color: "#000",
      fontWeight: "600",
    },
    // Listings grid
    listingsGrid: {
      flexDirection: "row",
      gap: 12,
      marginHorizontal: 20,
      marginTop: 12,
    },
    gridCol: { flex: 1, gap: 12 },
    listingCard: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 18,
      overflow: "hidden",
    },
    listingImageWrap: {
      width: "100%",
      height: 140,
      position: "relative",
    },
    listingImage: {
      width: "100%",
      height: "100%",
    },
    priceBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(74,222,128,0.9)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    priceBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#000",
    },
    soldOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    soldBadge: {
      backgroundColor: "rgba(30,30,30,0.9)",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    soldBadgeText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#fff",
    },
    listingContent: { padding: 12 },
    listingName: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.textPrimary,
    },
    listingDesc: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    sellerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
    },
    sellerAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    sellerAvatarFallback: {
      backgroundColor: theme.colors.backgroundChip,
      alignItems: "center",
      justifyContent: "center",
    },
    sellerName: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    contactBtn: {
      marginTop: 8,
      height: 34,
      borderRadius: 10,
      backgroundColor: "rgba(74,222,128,0.1)",
      borderWidth: 1,
      borderColor: "rgba(74,222,128,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    contactBtnText: {
      fontSize: 12,
      color: PRIMARY,
    },
    // Empty state
    emptyState: {
      alignItems: "center",
      marginTop: 40,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "300",
      color: theme.colors.textSecondary,
      marginTop: 12,
      textAlign: "center",
    },
    emptySub: {
      fontSize: 13,
      color: theme.colors.disabledText,
      marginTop: 4,
    },
    emptyLink: {
      fontSize: 14,
      color: PRIMARY,
      fontWeight: "500",
    },
    // FAB
    fab: {
      position: "absolute",
      bottom: 30,
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: PRIMARY,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: PRIMARY,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    // Store detail sheet
    sheetBanner: {
      width: "100%",
      height: 200,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    sheetBannerOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    sheetStoreName: {
      fontSize: 22,
      fontWeight: "300",
      color: "#fff",
      padding: 20,
      paddingBottom: 16,
    },
    sheetBody: {
      padding: 20,
      gap: 14,
    },
    sheetMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    sheetRatingText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    sheetCategoryChip: {
      backgroundColor: theme.colors.backgroundChip,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sheetCategoryText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    sheetDesc: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    sheetHoursRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    sheetHoursText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    mapsBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 48,
      borderRadius: 14,
      backgroundColor: "rgba(74,222,128,0.1)",
      borderWidth: 1,
      borderColor: "rgba(74,222,128,0.2)",
    },
    mapsBtnText: {
      fontSize: 14,
      color: PRIMARY,
      fontWeight: "500",
    },
    sheetSectionTitle: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    plantMiniCard: {
      width: 110,
      height: 130,
      borderRadius: 14,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    plantMiniOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "50%",
    },
    plantMiniName: {
      fontSize: 12,
      fontWeight: "600",
      color: "#fff",
      padding: 10,
      paddingBottom: 8,
    },
    // Add listing sheet
    addSheetContent: {
      padding: 20,
      gap: 16,
      paddingBottom: 40,
    },
    addSheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    addSheetTitle: {
      fontSize: 18,
      fontWeight: "300",
      color: theme.colors.textPrimary,
    },
    addSheetClose: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.backgroundChip,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    imagePicker: {
      width: "100%",
      height: 160,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.colors.backgroundChip,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    imagePickerPreview: {
      width: "100%",
      height: "100%",
    },
    imagePickerEmpty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    imagePickerText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    fieldWrap: { gap: 8 },
    fieldLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundChip,
      minHeight: 44,
      paddingHorizontal: 12,
    },
    inputRowMulti: {
      alignItems: "flex-start",
      paddingVertical: 10,
    },
    inputIcon: { marginRight: 8 },
    currencySymbol: {
      fontSize: 16,
      marginRight: 6,
      fontWeight: "500",
    },
    input: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 0,
    },
    inputMulti: {
      height: 72,
      textAlignVertical: "top",
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    catChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundChip,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    catChipActive: {
      backgroundColor: PRIMARY,
      borderColor: PRIMARY,
    },
    catChipText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    catChipTextActive: {
      color: "#000",
      fontWeight: "600",
    },
    contactToggle: {
      flexDirection: "row",
      gap: 10,
    },
    toggleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 42,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundChip,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toggleBtnActive: {
      backgroundColor: "rgba(74,222,128,0.1)",
      borderColor: PRIMARY,
    },
    toggleText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    toggleTextActive: {
      color: PRIMARY,
      fontWeight: "500",
    },
    publishBtn: {
      height: 52,
      borderRadius: 14,
      backgroundColor: PRIMARY,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    publishBtnDisabled: {
      opacity: 0.4,
    },
    publishBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#000",
    },
  });
