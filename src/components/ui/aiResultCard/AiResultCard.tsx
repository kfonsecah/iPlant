import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/desingSystem";
import { PlantIdentificationResult } from "../../../types-dtos/plant.types";
import { useAiResultCardStyles } from "./AiResultCard.styles";
import ConfidenceBadge from "../confidenceBadge/ConfidenceBadge";
import AppInput from "../appInput/AppInput";

export interface PlantEditData {
  nombre: string;
  categoria: string;
  descripcion: string;
  cuidados: string;
  frecuenciaRiego: string;
  confidence: number;
  imagen?: string;
}

interface AiResultCardProps {
  result: PlantIdentificationResult;
  onEdit?: (editedData: PlantEditData) => void;
  onConfirm: (confirmedData: PlantEditData) => void;
  onCancel?: () => void;
}

export default function AiResultCard({ result, onEdit, onConfirm, onCancel }: AiResultCardProps) {
  const theme = useTheme();
  const styles = useAiResultCardStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<PlantEditData>({
    nombre: result.plantName,
    categoria: "",
    descripcion: result.description || result.wikiDescription?.extract || "",
    cuidados: result.careInstructions || "",
    frecuenciaRiego: "7",
    confidence: result.probability,
  });

  const handleConfirm = () => {
    onConfirm(editData);
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (onEdit) {
      onEdit(editData);
    }
  };

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.sheetHeader}>
          <View style={styles.modalHandle} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 4 }}>
            <Text style={styles.sheetTitle}>Editar Información</Text>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.closeIcon}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.editModeContainer}>
            <AppInput
              label="Nombre"
              value={editData.nombre}
              onChangeText={(text) => setEditData({ ...editData, nombre: text })}
              placeholder="Nombre de la planta"
            />
            
            <AppInput
              label="Categoría"
              value={editData.categoria}
              onChangeText={(text) => setEditData({ ...editData, categoria: text })}
              placeholder="Ej: Interior, Exterior, Suculenta..."
            />
          </View>
        </ScrollView>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.confirmButton, { width: '100%' }]}
            onPress={handleConfirm}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textOnAccent }]}>
              Guardar y Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sheetHeader}>
        <View style={styles.modalHandle} />
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantName}>{result.plantName}</Text>
            {result.latinName && result.latinName !== result.plantName && (
              <Text style={styles.latinName}>({result.latinName})</Text>
            )}
          </View>
          <ConfidenceBadge confidence={result.probability} size="large" />
        </View>
      </View>
      
      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {result.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Acerca de esta planta</Text>
            <Text style={styles.sectionContent}>{result.description}</Text>
          </View>
        )}
        
        {result.careInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cuidados</Text>
            <Text style={styles.sectionContent}>{result.careInstructions}</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Ionicons name="close-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={20} color={theme.colors.textPrimary} />
          <Text style={[styles.buttonText, { color: theme.colors.textPrimary, marginLeft: 8 }]}>
            Editar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.textOnAccent} />
          <Text style={[styles.buttonText, { color: theme.colors.textOnAccent, marginLeft: 8 }]}>
            Confirmar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}