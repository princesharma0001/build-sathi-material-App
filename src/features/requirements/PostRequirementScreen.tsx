import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getMaterialsApi, Material } from "../buyer/material.api";
import { DeliveryAddress, getDeliveryAddressesApi } from "../buyer/address.api";
import { createRequirementApi } from "../buyer/requirement.api";
import Toast from "react-native-toast-message";

const DELIVERY_OPTIONS = [
  {
    id: "urgent",
    title: "Urgent",
    subtitle: "1–2 days",
    icon: "flash",
  },
  {
    id: "week",
    title: "Within a week",
    subtitle: "2–7 days",
    icon: "calendar",
  },
  {
    id: "flexible",
    title: "Flexible",
    subtitle: "Best available",
    icon: "time",
  },
];

const PostRequirementScreen = ({ navigation }: any) => {
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("");
  const [notes, setNotes] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>(
    []
  );

  const [selectedAddress, setSelectedAddress] =
    useState<DeliveryAddress | null>(null);

  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");

  const [showAddresses, setShowAddresses] = useState(false);

  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState("");
  const [showMaterials, setShowMaterials] = useState(false);
  const [showUnits, setShowUnits] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    material?: string;
    quantity?: string;
    unit?: string;
    location?: string;
    delivery?: string;
  }>({});

  const formatAddress = (address: DeliveryAddress) => {
    return [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const availableUnits = selectedMaterial?.unit ? [selectedMaterial.unit] : [];
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!material) {
      newErrors.material = "Please select a material.";
    }

    if (!quantity.trim()) {
      newErrors.quantity = "Please enter quantity.";
    } else if (Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity.";
    }

    if (!unit) {
      newErrors.unit = "Please select a unit.";
    }

    if (!selectedAddress) {
      newErrors.location = "Please select a delivery address.";
    }

    if (!deliveryPreference) {
      newErrors.delivery = "Please select a delivery preference.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const loadDeliveryAddresses = useCallback(async () => {
    try {
      setAddressesLoading(true);
      setAddressesError("");

      const data = await getDeliveryAddressesApi();

      setDeliveryAddresses(data);

      // Automatically select default address
      const defaultAddress = data.find((address) => address.isDefault);

      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setLocation(formatAddress(defaultAddress));
      }
    } catch (error: any) {
      console.log(
        "❌ DELIVERY ADDRESS ERROR:",
        error?.response?.data || error?.message
      );

      setAddressesError(
        error?.response?.data?.message || "Unable to load delivery addresses."
      );
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  const loadMaterials = useCallback(async () => {
    try {
      setMaterialsLoading(true);
      setMaterialsError("");

      const data = await getMaterialsApi();

      setMaterials(data);
    } catch (error: any) {
      console.log(
        "❌ MATERIAL LIST ERROR:",
        error?.response?.data || error?.message
      );

      setMaterialsError(
        error?.response?.data?.message ||
          "Unable to load materials. Please try again."
      );
    } finally {
      setMaterialsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
    loadDeliveryAddresses();
  }, [loadMaterials, loadDeliveryAddresses]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedMaterial) {
      Alert.alert("Material Required", "Please select a material.");
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        "Delivery Address Required",
        "Please select a delivery address."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        materialId: selectedMaterial.id,
        deliveryAddressId: selectedAddress.id,
        quantity: Number(quantity),
        unit,
        deliveryPreference,
        notes: notes.trim() || undefined,
      };

      console.log("📦 CREATE REQUIREMENT PAYLOAD:", payload);

      const response = await createRequirementApi(payload);

      console.log("✅ REQUIREMENT CREATED:", response);
      if (response?.success) {
        Toast.show({
          type: "success",
          text1: "Requirement Posted",
          text2: "Your requirement has been sent to verified suppliers.",
          position: "top",
          visibilityTime: 2500,
        });

        setTimeout(() => {
          navigation.navigate("Buyer", {
            screen: "MyRequirements",
          });
        }, 1200);
      } else {
        Toast.show({
          type: "error",
          text1: "Unable to Post",
          text2: response?.message || "Something went wrong.",
          position: "top",
          visibilityTime: 2500,
        });
      }
    } catch (error: any) {
      console.log("❌ CREATE REQUIREMENT STATUS:", error?.response?.status);

      console.log(
        "❌ CREATE REQUIREMENT DATA:",
        JSON.stringify(error?.response?.data, null, 2)
      );

      console.log("❌ CREATE REQUIREMENT MESSAGE:", error?.message);

      console.log("❌ CREATE REQUIREMENT URL:", error?.config?.url);

      Alert.alert(
        "Unable to Post Requirement",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color="#0A0A0A" />
          </Pressable>

          <View style={styles.headerCenter}>
            {/* <Text style={styles.brand}>BUILDSATHI</Text> */}
            <Text style={styles.headerTitle}>Post Requirement</Text>
          </View>

          {/* <View style={styles.headerIcon}>
            <Ionicons name="document-text-outline" size={21} color="#FF7A00" />
          </View> */}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* HERO */}
          <LinearGradient
            colors={["#0A0A0A", "#21170C", "#3A2608"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroGlow} />

            <View style={styles.heroIcon}>
              <Ionicons name="construct-outline" size={25} color="#FFD76A" />
            </View>

            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Tell us what you need</Text>

              <Text style={styles.heroSubtitle}>
                Get competitive quotes from verified material suppliers.
              </Text>
            </View>

            {/* <View style={styles.verifiedPill}>
              <Ionicons name="shield-checkmark" size={13} color="#FFD76A" />
              <Text style={styles.verifiedPillText}>Verified Suppliers</Text>
            </View> */}
          </LinearGradient>

          {/* MATERIAL SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>01</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Material details</Text>
                <Text style={styles.sectionSubtitle}>
                  What construction material do you need?
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Material <Text style={styles.required}>*</Text>
            </Text>

            <Pressable
              style={[styles.selectBox, errors.material && styles.inputError]}
              onPress={() => {
                setShowMaterials(!showMaterials);
                setShowUnits(false);
              }}
            >
              <View style={styles.selectLeft}>
                <View style={styles.inputIcon}>
                  <Ionicons name="cube-outline" size={18} color="#FF7A00" />
                </View>

                <Text
                  style={[styles.selectText, !material && styles.placeholder]}
                >
                  {material || "Select material"}
                </Text>
              </View>

              <Ionicons
                name={showMaterials ? "chevron-up" : "chevron-down"}
                size={18}
                color="#8C8175"
              />
            </Pressable>

            {errors.material && (
              <Text style={styles.errorText}>{errors.material}</Text>
            )}

            {showMaterials && (
              <View style={styles.dropdown}>
                {materialsLoading ? (
                  <View style={styles.loadingMaterial}>
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#FF7A00"
                    />

                    <Text style={styles.loadingMaterialText}>
                      Loading materials...
                    </Text>
                  </View>
                ) : materialsError ? (
                  <Pressable
                    style={styles.loadingMaterial}
                    onPress={loadMaterials}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color="#D94C3D"
                    />

                    <Text style={styles.loadingMaterialText}>
                      {materialsError}
                    </Text>

                    <Ionicons
                      name="refresh-outline"
                      size={17}
                      color="#FF7A00"
                    />
                  </Pressable>
                ) : materials.length === 0 ? (
                  <View style={styles.loadingMaterial}>
                    <Ionicons name="cube-outline" size={19} color="#8C8175" />

                    <Text style={styles.loadingMaterialText}>
                      No materials available
                    </Text>
                  </View>
                ) : (
                  materials.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.dropdownItem,
                        index === materials.length - 1 &&
                          styles.lastDropdownItem,
                      ]}
                      onPress={() => {
                        setSelectedMaterial(item);
                        setMaterial(item.name);

                        // Automatically use Admin's unit
                        setUnit(item.unit);

                        setShowMaterials(false);
                        setShowUnits(false);

                        setErrors((prev) => ({
                          ...prev,
                          material: undefined,
                          unit: undefined,
                        }));
                      }}
                    >
                      <View style={styles.materialOptionLeft}>
                        <View style={styles.materialOptionIcon}>
                          <Ionicons
                            name="cube-outline"
                            size={16}
                            color="#FF7A00"
                          />
                        </View>

                        <View style={styles.materialOptionText}>
                          <Text
                            style={[
                              styles.dropdownText,
                              material === item.name &&
                                styles.dropdownTextActive,
                            ]}
                          >
                            {item.name}
                          </Text>

                          {item.category?.name ? (
                            <Text style={styles.materialCategoryText}>
                              {item.category.name}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {material === item.name && (
                        <Ionicons
                          name="checkmark-circle"
                          size={19}
                          color="#FF7A00"
                        />
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {/* QUANTITY */}
            <View style={styles.quantityRow}>
              <View style={styles.quantityColumn}>
                <Text style={styles.label}>
                  Quantity <Text style={styles.required}>*</Text>
                </Text>

                <View
                  style={[
                    styles.textInputWrapper,
                    errors.quantity && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="calculator-outline"
                    size={18}
                    color="#FF7A00"
                  />

                  <TextInput
                    value={quantity}
                    onChangeText={(value) => {
                      setQuantity(value);
                      setErrors((prev) => ({
                        ...prev,
                        quantity: undefined,
                      }));
                    }}
                    placeholder="e.g. 20"
                    placeholderTextColor="#B6AA9D"
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>

                {errors.quantity && (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                )}
              </View>

              <View style={styles.unitColumn}>
                <Text style={styles.label}>
                  Unit <Text style={styles.required}>*</Text>
                </Text>

                <Pressable
                  disabled={!material}
                  style={[
                    styles.selectBox,
                    !material && styles.disabledSelectBox,
                    errors.unit && styles.inputError,
                  ]}
                  onPress={() => {
                    if (!material) return;

                    setShowUnits(!showUnits);
                    setShowMaterials(false);
                  }}
                >
                  <Text
                    style={[styles.selectText, !unit && styles.placeholder]}
                    numberOfLines={1}
                  >
                    {unit ||
                      (material ? "Select unit" : "Select material first")}
                  </Text>

                  <Ionicons
                    name={showUnits ? "chevron-up" : "chevron-down"}
                    size={17}
                    color={!material ? "#C4B9AE" : "#8C8175"}
                  />
                </Pressable>

                {errors.unit && (
                  <Text style={styles.errorText}>{errors.unit}</Text>
                )}

                {showUnits && availableUnits.length > 0 && (
                  <View style={styles.unitDropdown}>
                    {availableUnits.map((item) => (
                      <Pressable
                        key={item}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setUnit(item);
                          setShowUnits(false);

                          setErrors((prev) => ({
                            ...prev,
                            unit: undefined,
                          }));
                        }}
                      >
                        <View style={styles.unitOptionLeft}>
                          <View style={styles.unitOptionIcon}>
                            <Ionicons
                              name="cube-outline"
                              size={15}
                              color="#FF7A00"
                            />
                          </View>

                          <Text
                            style={[
                              styles.dropdownText,
                              unit === item && styles.dropdownTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </View>

                        {unit === item && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#FF7A00"
                          />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* DELIVERY SECTION */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>02</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Delivery details</Text>
                <Text style={styles.sectionSubtitle}>
                  Where and when should we deliver?
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Delivery location <Text style={styles.required}>*</Text>
            </Text>

            <Pressable
              style={[
                styles.locationInput,
                errors.location && styles.inputError,
                addressesLoading && styles.disabledSelectBox,
              ]}
              disabled={addressesLoading}
              onPress={() => {
                setShowAddresses(!showAddresses);
              }}
            >
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={18} color="#FF7A00" />
              </View>

              <View style={styles.selectedAddressContent}>
                <Text
                  style={[
                    styles.selectedAddressText,
                    !selectedAddress && styles.placeholder,
                  ]}
                  numberOfLines={2}
                >
                  {addressesLoading
                    ? "Loading saved addresses..."
                    : selectedAddress
                    ? formatAddress(selectedAddress)
                    : "Select delivery address"}
                </Text>

                {selectedAddress && (
                  <Text style={styles.selectedAddressLabel}>
                    {selectedAddress.label || "Delivery Address"}
                  </Text>
                )}
              </View>

              <Ionicons
                name={showAddresses ? "chevron-up" : "chevron-down"}
                size={18}
                color="#8C8175"
              />
            </Pressable>
            {showAddresses && (
              <View style={styles.addressDropdown}>
                {addressesLoading ? (
                  <View style={styles.loadingMaterial}>
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#FF7A00"
                    />

                    <Text style={styles.loadingMaterialText}>
                      Loading addresses...
                    </Text>
                  </View>
                ) : addressesError ? (
                  <Pressable
                    style={styles.loadingMaterial}
                    onPress={loadDeliveryAddresses}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color="#D94C3D"
                    />

                    <Text style={styles.loadingMaterialText}>
                      {addressesError}
                    </Text>

                    <Ionicons
                      name="refresh-outline"
                      size={17}
                      color="#FF7A00"
                    />
                  </Pressable>
                ) : deliveryAddresses.length === 0 ? (
                  <View style={styles.emptyAddress}>
                    <View style={styles.emptyAddressIcon}>
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#8C8175"
                      />
                    </View>

                    <Text style={styles.emptyAddressText}>
                      No saved delivery addresses found.
                    </Text>
                  </View>
                ) : (
                  deliveryAddresses?.map((address, index) => {
                    const selected = selectedAddress?.id === address.id;

                    return (
                      <Pressable
                        key={address.id}
                        style={[
                          styles.addressOption,
                          index === deliveryAddresses.length - 1 &&
                            styles.lastDropdownItem,
                        ]}
                        onPress={() => {
                          setSelectedAddress(address);
                          setLocation(formatAddress(address));
                          setShowAddresses(false);

                          setErrors((prev) => ({
                            ...prev,
                            location: undefined,
                          }));
                        }}
                      >
                        <View style={styles.addressOptionIcon}>
                          <Ionicons
                            name={
                              address.isDefault
                                ? "location"
                                : "location-outline"
                            }
                            size={17}
                            color="#FF7A00"
                          />
                        </View>

                        <View style={styles.addressOptionContent}>
                          <View style={styles.addressTitleRow}>
                            <Text style={styles.addressLabel}>
                              {address.label || "Delivery Address"}
                            </Text>

                            {address.isDefault && (
                              <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>
                                  DEFAULT
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.addressName} numberOfLines={1}>
                            {address.name}
                            {address.phone ? ` • ${address.phone}` : ""}
                          </Text>

                          <Text
                            style={styles.addressDescription}
                            numberOfLines={3}
                          >
                            {formatAddress(address)}
                          </Text>
                        </View>

                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#FF7A00"
                          />
                        )}
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}

            {errors.location && (
              <Text style={styles.errorText}>{errors.location}</Text>
            )}

            <Text style={[styles.label, { marginTop: 18 }]}>
              Delivery preference <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.deliveryGrid}>
              {DELIVERY_OPTIONS.map((option) => {
                const selected = deliveryPreference === option.id;

                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.deliveryCard,
                      selected && styles.deliveryCardSelected,
                    ]}
                    onPress={() => {
                      setDeliveryPreference(option.id);
                      setErrors((prev) => ({
                        ...prev,
                        delivery: undefined,
                      }));
                    }}
                  >
                    <View
                      style={[
                        styles.deliveryIcon,
                        selected && styles.deliveryIconSelected,
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={18}
                        color={selected ? "#FFFFFF" : "#FF7A00"}
                      />
                    </View>

                    <Text
                      style={[
                        styles.deliveryTitle,
                        selected && styles.deliveryTitleSelected,
                      ]}
                    >
                      {option.title}
                    </Text>

                    <Text
                      style={[
                        styles.deliverySubtitle,
                        selected && styles.deliverySubtitleSelected,
                      ]}
                    >
                      {option.subtitle}
                    </Text>

                    {selected && (
                      <View style={styles.selectedCheck}>
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {errors.delivery && (
              <Text style={styles.errorText}>{errors.delivery}</Text>
            )}
          </View>

          {/* NOTES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>03</Text>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Additional information</Text>
                <Text style={styles.sectionSubtitle}>
                  Anything else suppliers should know?
                </Text>
              </View>

              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>OPTIONAL</Text>
              </View>
            </View>

            <View style={styles.notesWrapper}>
              <Ionicons
                name="create-outline"
                size={18}
                color="#FF7A00"
                style={styles.notesIcon}
              />

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add quality requirements, preferred brand, site instructions..."
                placeholderTextColor="#B6AA9D"
                multiline
                textAlignVertical="top"
                style={styles.notesInput}
              />
            </View>
          </View>

          {/* SUBMIT */}
          <Pressable
            disabled={loading}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitWrapper,
              pressed && !loading && styles.submitPressed,
            ]}
          >
            <LinearGradient
              colors={
                loading
                  ? ["#B8AFA5", "#9E958C"]
                  : ["#FF7A00", "#FF951C", "#FFB12E"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              {/* <View style={styles.submitIcon}>
                <Ionicons
                  name={loading ? 'hourglass-outline' : 'send'}
                  size={18}
                  color="#FFFFFF"
                />
              </View> */}

              <Text style={styles.submitText}>
                {loading ? "Posting Requirement..." : "Post Requirement"}
              </Text>

              {/* {!loading && (
                <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
              )} */}
            </LinearGradient>
          </Pressable>

          <Text style={styles.bottomHint}>
            You can edit or cancel your requirement anytime.
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default PostRequirementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  /* HEADER */

  header: {
    // minHeight: 92,
    paddingHorizontal: 16,
    // paddingTop: 24,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // borderBottomWidth: 1,
    // borderBottomColor: '#F1E2D0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "#F0DEC4",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.2,
    color: "#FF7A00",
  },

  loadingMaterial: {
    minHeight: 55,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loadingMaterialText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: "#8C8175",
  },

  materialOptionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  materialOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 9,
  },

  materialOptionText: {
    flex: 1,
  },

  materialCategoryText: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "500",
    color: "#A79B8E",
  },
  headerTitle: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8ED",
    borderWidth: 1,
    borderColor: "#F0DEC4",
  },

  /* CONTENT */

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* HERO */

  heroCard: {
    minHeight: 100,
    // padding: 18,
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },

  heroGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    right: -40,
    top: -55,
    backgroundColor: "rgba(255,215,106,0.10)",
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,106,0.22)",
    marginLeft: 14,
    marginTop: 25,
  },

  heroText: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 4,
    marginTop: 14,
  },

  heroTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroSubtitle: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
    color: "#D9D0C5",
  },

  verifiedPill: {
    position: "absolute",
    left: 18,
    bottom: 16,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,106,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,215,106,0.18)",
  },

  verifiedPillText: {
    marginLeft: 5,
    fontSize: 9,
    fontWeight: "800",
    color: "#FFD76A",
  },

  /* SECTIONS */

  section: {
    marginTop: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  sectionNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD6AE",
    marginRight: 11,
  },

  sectionNumberText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FF7A00",
    letterSpacing: 0.5,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#95897D",
    fontWeight: "500",
  },

  optionalBadge: {
    marginLeft: "auto",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F8F5F1",
  },

  optionalText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#9C9186",
    letterSpacing: 0.5,
  },

  /* INPUTS */

  label: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "800",
    color: "#51483F",
  },

  required: {
    color: "#FF7A00",
  },

  selectBox: {
    minHeight: 52,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEDFCC",
    backgroundColor: "#FFFCF8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 9,
  },

  selectText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#27221D",
  },

  placeholder: {
    color: "#B6AA9D",
    fontWeight: "500",
  },

  textInputWrapper: {
    height: 52,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEDFCC",
    backgroundColor: "#FFFCF8",
    flexDirection: "row",
    alignItems: "center",
  },

  textInput: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: "700",
    color: "#27221D",
  },

  inputError: {
    borderColor: "#E66A5C",
  },

  errorText: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: "600",
    color: "#D94C3D",
  },

  dropdown: {
    marginTop: 7,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0DFCC",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  unitDropdown: {
    position: "absolute",
    top: 77,
    left: 0,
    right: 0,
    zIndex: 20,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0DFCC",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 7,
  },

  dropdownItem: {
    minHeight: 43,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F5ECE2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lastDropdownItem: {
    borderBottomWidth: 0,
  },

  dropdownText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#51483F",
  },

  dropdownTextActive: {
    color: "#FF7A00",
    fontWeight: "900",
  },

  quantityRow: {
    marginTop: 15,
    flexDirection: "row",
  },

  quantityColumn: {
    flex: 1,
    marginRight: 8,
  },

  unitColumn: {
    flex: 0.82,
    position: "relative",
  },

  /* LOCATION */

  locationInput: {
    minHeight: 60,
    height: 70,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEDFCC",
    backgroundColor: "#FFFCF8",
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 8,
  },

  locationTextInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 12,
    fontWeight: "600",
    color: "#27221D",
  },

  currentLocationButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E7",
    borderWidth: 1,
    borderColor: "#FFD6AE",
  },

  /* DELIVERY */

  deliveryGrid: {
    flexDirection: "row",
  },

  deliveryCard: {
    flex: 1,
    minHeight: 103,
    padding: 10,
    marginRight: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEDFCC",
    backgroundColor: "#FFFCF8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  deliveryCardSelected: {
    backgroundColor: "#FFF0DF",
    borderColor: "#FF9F1C",
    borderWidth: 1.5,
  },

  deliveryCardLast: {
    marginRight: 0,
  },

  deliveryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  deliveryIconSelected: {
    backgroundColor: "#FF7A00",
  },

  deliveryTitle: {
    marginTop: 7,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    color: "#302922",
  },

  deliveryTitleSelected: {
    color: "#C95B00",
  },

  deliverySubtitle: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: "600",
    color: "#95897D",
  },

  deliverySubtitleSelected: {
    color: "#A96B36",
  },

  selectedCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
  },

  /* NOTES */

  notesWrapper: {
    minHeight: 112,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEDFCC",
    backgroundColor: "#FFFCF8",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notesIcon: {
    marginTop: 2,
    marginRight: 9,
  },

  notesInput: {
    flex: 1,
    minHeight: 88,
    padding: 0,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
    color: "#27221D",
  },

  /* TRUST */

  trustCard: {
    marginTop: 16,
    minHeight: 78,
    padding: 13,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#F2D9A5",
    flexDirection: "row",
    alignItems: "center",
  },

  selectedAddressContent: {
    flex: 1,
    marginRight: 8,
  },

  selectedAddressText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#27221D",
  },

  selectedAddressLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "800",
    color: "#FF7A00",
    textTransform: "uppercase",
  },

  addressDropdown: {
    marginTop: 7,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0DFCC",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },

  addressOption: {
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F5ECE2",
    flexDirection: "row",
    alignItems: "center",
  },

  addressOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 10,
  },

  addressOptionContent: {
    flex: 1,
    marginRight: 8,
  },

  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#302922",
  },

  addressName: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#51483F",
  },

  addressDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "500",
    color: "#95897D",
  },

  defaultBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#FFF0DF",
  },

  defaultBadgeText: {
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.4,
    color: "#FF7A00",
  },

  emptyAddress: {
    minHeight: 90,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyAddressIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F5F1",
    marginBottom: 7,
  },

  emptyAddressText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8C8175",
    textAlign: "center",
  },
  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF9E4",
    borderWidth: 1,
    borderColor: "#F3DEA9",
  },

  trustTextContainer: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  trustTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#5B4610",
  },

  trustSubtitle: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "500",
    color: "#8A7650",
  },

  /* SUBMIT */

  submitWrapper: {
    marginTop: 18,
    borderRadius: 17,
    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  submitPressed: {
    transform: [{ scale: 0.985 }],
  },

  submitButton: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  submitIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  submitText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  bottomHint: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "500",
    color: "#A79B8E",
  },

  bottomSpace: {
    height: 30,
  },
});
